import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    role : Text; // "owner" or "staff"
    email : Text;
    firmId : Text; // Firm identifier for multi-tenancy
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Track firm owners for authorization
  let firmOwners = Map.empty<Text, Principal>();

  // Trial mode tracking
  let firmClientCounts = Map.empty<Text, Nat>();
  let trialModeFirms = Map.empty<Text, Bool>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Check if this is initial profile creation or update
    switch (userProfiles.get(caller)) {
      case (null) {
        // New profile - validate role assignment
        // Only allow self-assignment of "owner" if no owner exists for this firm
        if (profile.role == "owner") {
          switch (firmOwners.get(profile.firmId)) {
            case (null) {
              // First owner for this firm
              firmOwners.add(profile.firmId, caller);
              trialModeFirms.add(profile.firmId, true); // New firms start in trial mode
            };
            case (?existingOwner) {
              if (existingOwner != caller) {
                Runtime.trap("Unauthorized: Firm already has an owner. Contact the owner to assign staff role.");
              };
            };
          };
        };
        userProfiles.add(caller, profile);
      };
      case (?existingProfile) {
        // Profile update - prevent role/firmId escalation
        if (existingProfile.role != profile.role) {
          Runtime.trap("Unauthorized: Cannot change your own role. Contact firm owner or admin.");
        };
        if (existingProfile.firmId != profile.firmId) {
          Runtime.trap("Unauthorized: Cannot change firm association. Contact admin.");
        };
        // Allow updating name and email only
        let updatedProfile = {
          name = profile.name;
          role = existingProfile.role;
          email = profile.email;
          firmId = existingProfile.firmId;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Admin function to assign staff roles
  public shared ({ caller }) func assignStaffRole(staffPrincipal : Principal, firmId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can assign roles");
    };

    let callerProfile = getCallerProfile(caller);

    // Only firm owner can assign staff
    if (callerProfile.role != "owner" or callerProfile.firmId != firmId) {
      Runtime.trap("Unauthorized: Only firm owner can assign staff roles");
    };

    // Check if staff already has a profile
    switch (userProfiles.get(staffPrincipal)) {
      case (?existing) {
        Runtime.trap("User already has a profile");
      };
      case (null) {
        // Create staff profile
        let staffProfile : UserProfile = {
          name = "";
          role = "staff";
          email = "";
          firmId = firmId;
        };
        userProfiles.add(staffPrincipal, staffProfile);
      };
    };
  };

  // Helper function to get caller's profile
  func getCallerProfile(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found. Please complete registration.") };
      case (?profile) { profile };
    };
  };

  // Helper function to check if caller is owner
  func isOwner(caller : Principal) : Bool {
    let profile = getCallerProfile(caller);
    profile.role == "owner";
  };

  // Helper function to check firm membership
  func checkFirmAccess(caller : Principal, firmId : Text) {
    let profile = getCallerProfile(caller);
    if (profile.firmId != firmId) {
      Runtime.trap("Unauthorized: Access denied to this firm's data");
    };
  };

  // Helper function to check trial mode limits
  func checkTrialLimit(firmId : Text) {
    switch (trialModeFirms.get(firmId)) {
      case (?true) {
        // In trial mode
        let count = switch (firmClientCounts.get(firmId)) {
          case (null) { 0 };
          case (?c) { c };
        };
        if (count >= 5) {
          Runtime.trap("Trial mode limit reached: Maximum 5 clients allowed. Please upgrade.");
        };
      };
      case (_) {
        // Not in trial mode or trial disabled
      };
    };
  };

  // Function to disable trial mode (owner only)
  public shared ({ caller }) func disableTrialMode() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can disable trial mode");
    };

    let profile = getCallerProfile(caller);
    if (profile.role != "owner") {
      Runtime.trap("Unauthorized: Only firm owner can disable trial mode");
    };

    trialModeFirms.add(profile.firmId, false);
  };

  // Types
  type ClientId = Nat;
  type DocumentInwardId = Nat;
  type WorkProcessingId = Nat;
  type OutwardDocumentId = Nat;
  type InvoiceId = Nat;
  type ActivityLogId = Nat;

  public type Client = {
    id : ClientId;
    name : Text;
    pan : Text;
    mobile : Text;
    email : Text;
    clientType : Text;
    sourceOfIncome : Text;
    createdAt : Int;
    createdBy : Text;
    firmId : Text; // Firm ownership
  };

  public type DocumentInward = {
    id : DocumentInwardId;
    clientId : ClientId;
    dateOfReceipt : Text;
    mode : Text;
    documentStatus : Text;
    remarks : Text;
    firmId : Text;
  };

  public type WorkProcessing = {
    id : WorkProcessingId;
    clientId : ClientId;
    filingStatus : Text;
    itrFormType : Text;
    ackNumber : Text;
    dateOfFiling : Text;
    dueDateOfFiling : Text;
    firmId : Text;
  };

  public type OutwardDocument = {
    id : OutwardDocumentId;
    clientId : ClientId;
    outwardStatus : Text;
    readyDate : Text;
    firmId : Text;
  };

  public type Invoice = {
    id : InvoiceId;
    clientId : ClientId;
    invoiceNumber : Text;
    amount : Nat;
    generatedAt : Int;
    generatedBy : Text;
    paid : Bool;
    firmId : Text;
  };

  public type ActivityLog = {
    id : ActivityLogId;
    timestamp : Int;
    userId : Text;
    userName : Text;
    role : Text;
    action : Text;
    details : Text;
    clientId : Text;
    firmId : Text;
  };

  public type DashboardStats = {
    totalClients : Nat;
    pendingITR : Nat;
    inProgressITR : Nat;
    filedITR : Nat;
    documentsPending : Nat;
    readyForDelivery : Nat;
  };

  public type ExportData = {
    clients : [Client];
    documents : [DocumentInward];
    workProcessing : [WorkProcessing];
    billing : [Invoice];
  };

  // Persistent storage
  let clients = Map.empty<ClientId, Client>();
  let documentInwards = Map.empty<DocumentInwardId, DocumentInward>();
  let workProcessings = Map.empty<WorkProcessingId, WorkProcessing>();
  let outwardDocuments = Map.empty<OutwardDocumentId, OutwardDocument>();
  let invoices = Map.empty<InvoiceId, Invoice>();
  let activityLogs = Map.empty<ActivityLogId, ActivityLog>();

  // Compare modules
  module Client {
    public func compare(client1 : Client, client2 : Client) : Order.Order {
      Nat.compare(client1.id, client2.id);
    };
  };

  module DocumentInward {
    public func compare(d1 : DocumentInward, d2 : DocumentInward) : Order.Order {
      Nat.compare(d1.id, d2.id);
    };
  };

  module WorkProcessing {
    public func compare(wp1 : WorkProcessing, wp2 : WorkProcessing) : Order.Order {
      Nat.compare(wp1.id, wp2.id);
    };
  };

  module OutwardDocument {
    public func compare(o1 : OutwardDocument, o2 : OutwardDocument) : Order.Order {
      Nat.compare(o1.id, o2.id);
    };
  };

  module Invoice {
    public func compare(i1 : Invoice, i2 : Invoice) : Order.Order {
      Nat.compare(i1.id, i2.id);
    };
  };

  module ActivityLog {
    public func compare(a1 : ActivityLog, a2 : ActivityLog) : Order.Order {
      Nat.compare(a1.id, a2.id);
    };
  };

  // Counters
  var nextClientId : ClientId = 1;
  var nextDocumentInwardId : DocumentInwardId = 1;
  var nextWorkProcessingId : WorkProcessingId = 1;
  var nextOutwardDocumentId : OutwardDocumentId = 1;
  var nextInvoiceId : InvoiceId = 1;
  var nextActivityLogId : ActivityLogId = 1;

  // Helper functions
  func getClientInternal(id : ClientId) : Client {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) { client };
    };
  };

  // Client operations - All authenticated users can manage clients within their firm
  public shared ({ caller }) func createClient(client : Client) : async ClientId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create clients");
    };
    let profile = getCallerProfile(caller);
    checkFirmAccess(caller, client.firmId);

    // Check trial mode limit
    checkTrialLimit(profile.firmId);

    let newClient : Client = {
      client with
      id = nextClientId;
      createdAt = Time.now();
      firmId = profile.firmId; // Enforce firm ownership
    };
    clients.add(nextClientId, newClient);

    // Update firm client count
    let currentCount = switch (firmClientCounts.get(profile.firmId)) {
      case (null) { 0 };
      case (?c) { c };
    };
    firmClientCounts.add(profile.firmId, currentCount + 1);

    nextClientId += 1;
    newClient.id;
  };

  public shared ({ caller }) func updateClient(client : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update clients");
    };
    let existingClient = getClientInternal(client.id);
    checkFirmAccess(caller, existingClient.firmId);
    let profile = getCallerProfile(caller);
    let updatedClient = { client with firmId = profile.firmId };
    clients.add(client.id, updatedClient);
  };

  public shared ({ caller }) func deleteClient(id : ClientId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete clients");
    };
    let client = getClientInternal(id);
    checkFirmAccess(caller, client.firmId);

    clients.remove(id);

    // Update firm client count
    let profile = getCallerProfile(caller);
    let currentCount = switch (firmClientCounts.get(profile.firmId)) {
      case (null) { 0 };
      case (?c) { c };
    };
    switch (currentCount) {
      case (0) {};
      case (_) {
        firmClientCounts.add(profile.firmId, currentCount - 1);
      };
    };
  };

  public query ({ caller }) func getClient(id : ClientId) : async Client {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view clients");
    };
    let client = getClientInternal(id);
    checkFirmAccess(caller, client.firmId);
    client;
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view clients");
    };
    let profile = getCallerProfile(caller);
    clients.values().toArray()
      .filter(func(c) { c.firmId == profile.firmId })
      .sort();
  };

  // DocumentInward operations - All users can manage within their firm
  public shared ({ caller }) func addDocumentInward(doc : DocumentInward) : async DocumentInwardId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add document inward");
    };
    let client = getClientInternal(doc.clientId);
    checkFirmAccess(caller, client.firmId);
    let profile = getCallerProfile(caller);
    let newDoc : DocumentInward = {
      doc with
      id = nextDocumentInwardId;
      firmId = profile.firmId;
    };
    documentInwards.add(nextDocumentInwardId, newDoc);
    nextDocumentInwardId += 1;
    newDoc.id;
  };

  public shared ({ caller }) func updateDocumentInward(doc : DocumentInward) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update document inward");
    };
    switch (documentInwards.get(doc.id)) {
      case (null) { Runtime.trap("Document not found") };
      case (?existing) {
        checkFirmAccess(caller, existing.firmId);
        let profile = getCallerProfile(caller);
        let updated = { doc with firmId = profile.firmId };
        documentInwards.add(doc.id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteDocumentInward(id : DocumentInwardId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete documents");
    };
    switch (documentInwards.get(id)) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) {
        checkFirmAccess(caller, doc.firmId);
        documentInwards.remove(id);
      };
    };
  };

  public query ({ caller }) func getDocumentInwardByClient(clientId : ClientId) : async [DocumentInward] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view document inward");
    };
    let client = getClientInternal(clientId);
    checkFirmAccess(caller, client.firmId);
    let profile = getCallerProfile(caller);
    documentInwards.values().toArray()
      .filter(func(doc) { doc.clientId == clientId and doc.firmId == profile.firmId });
  };

  // WorkProcessing operations - All users can manage within their firm
  public shared ({ caller }) func addWorkProcessing(wp : WorkProcessing) : async WorkProcessingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add work processing");
    };
    let client = getClientInternal(wp.clientId);
    checkFirmAccess(caller, client.firmId);
    let profile = getCallerProfile(caller);
    let newWp : WorkProcessing = {
      wp with
      id = nextWorkProcessingId;
      firmId = profile.firmId;
    };
    workProcessings.add(nextWorkProcessingId, newWp);
    nextWorkProcessingId += 1;
    newWp.id;
  };

  public shared ({ caller }) func updateWorkProcessing(wp : WorkProcessing) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update work processing");
    };
    switch (workProcessings.get(wp.id)) {
      case (null) { Runtime.trap("WorkProcessing not found") };
      case (?existing) {
        checkFirmAccess(caller, existing.firmId);
        let profile = getCallerProfile(caller);
        let updated = { wp with firmId = profile.firmId };
        workProcessings.add(wp.id, updated);
      };
    };
  };

  public query ({ caller }) func getWorkProcessingByClient(clientId : ClientId) : async [WorkProcessing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view work processing");
    };
    let client = getClientInternal(clientId);
    checkFirmAccess(caller, client.firmId);
    let profile = getCallerProfile(caller);
    workProcessings.values().toArray()
      .filter(func(wp) { wp.clientId == clientId and wp.firmId == profile.firmId });
  };

  public query ({ caller }) func getAllWorkProcessing() : async [WorkProcessing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view work processing");
    };
    let profile = getCallerProfile(caller);
    workProcessings.values().toArray()
      .filter(func(wp) { wp.firmId == profile.firmId })
      .sort();
  };

  // OutwardDocument operations - All users can manage within their firm
  public shared ({ caller }) func updateOutwardStatus(od : OutwardDocument) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update outward status");
    };
    let client = getClientInternal(od.clientId);
    checkFirmAccess(caller, client.firmId);
    let profile = getCallerProfile(caller);
    let updated = { od with firmId = profile.firmId };
    switch (outwardDocuments.get(od.id)) {
      case (null) {
        outwardDocuments.add(od.id, updated);
      };
      case (?existing) {
        checkFirmAccess(caller, existing.firmId);
        outwardDocuments.add(od.id, updated);
      };
    };
  };

  public query ({ caller }) func getOutwardStatusByClient(clientId : ClientId) : async [OutwardDocument] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view outward status");
    };
    let client = getClientInternal(clientId);
    checkFirmAccess(caller, client.firmId);
    let profile = getCallerProfile(caller);
    outwardDocuments.values().toArray()
      .filter(func(od) { od.clientId == clientId and od.firmId == profile.firmId });
  };

  public query ({ caller }) func getAllOutwardDocuments() : async [OutwardDocument] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view outward documents");
    };
    let profile = getCallerProfile(caller);
    outwardDocuments.values().toArray()
      .filter(func(od) { od.firmId == profile.firmId })
      .sort();
  };

  // Invoice operations - OWNER ONLY per business rules
  public shared ({ caller }) func generateInvoice(invoice : Invoice) : async InvoiceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can generate invoices");
    };
    // Business rule: Billing accessible only to owner role
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only firm owners can generate invoices");
    };
    let client = getClientInternal(invoice.clientId);
    checkFirmAccess(caller, client.firmId);
    let profile = getCallerProfile(caller);
    let newInvoice : Invoice = {
      invoice with
      id = nextInvoiceId;
      generatedAt = Time.now();
      firmId = profile.firmId;
    };
    invoices.add(nextInvoiceId, newInvoice);
    nextInvoiceId += 1;
    newInvoice.id;
  };

  public query ({ caller }) func getInvoiceByClient(clientId : ClientId) : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view invoices");
    };
    // Business rule: Billing accessible only to owner role
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only firm owners can view invoices");
    };
    let client = getClientInternal(clientId);
    checkFirmAccess(caller, client.firmId);
    let profile = getCallerProfile(caller);
    invoices.values().toArray()
      .filter(func(inv) { inv.clientId == clientId and inv.firmId == profile.firmId });
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view invoices");
    };
    // Business rule: Billing accessible only to owner role
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only firm owners can view invoices");
    };
    let profile = getCallerProfile(caller);
    invoices.values().toArray()
      .filter(func(inv) { inv.firmId == profile.firmId })
      .sort();
  };

  public shared ({ caller }) func markInvoicePaid(id : InvoiceId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark invoices as paid");
    };
    // Business rule: Billing accessible only to owner role
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only firm owners can mark invoices as paid");
    };
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?inv) {
        checkFirmAccess(caller, inv.firmId);
        let updatedInv = { inv with paid = true };
        invoices.add(id, updatedInv);
      };
    };
  };

  // ActivityLog operations - All users can add, owners can view all
  public shared ({ caller }) func addActivityLog(log : ActivityLog) : async ActivityLogId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add activity logs");
    };
    let profile = getCallerProfile(caller);
    let newLog : ActivityLog = {
      log with
      id = nextActivityLogId;
      timestamp = Time.now();
      firmId = profile.firmId;
    };
    activityLogs.add(nextActivityLogId, newLog);
    nextActivityLogId += 1;
    newLog.id;
  };

  public query ({ caller }) func getAllActivityLogs() : async [ActivityLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view activity logs");
    };
    let profile = getCallerProfile(caller);
    activityLogs.values().toArray()
      .filter(func(log) { log.firmId == profile.firmId })
      .sort();
  };

  public query ({ caller }) func getActivityLogsByClient(clientId : Text) : async [ActivityLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view activity logs");
    };
    let profile = getCallerProfile(caller);
    activityLogs.values().toArray()
      .filter(func(log) { log.clientId == clientId and log.firmId == profile.firmId });
  };

  // Dashboard Stats - OWNER ONLY per business rules
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view dashboard stats");
    };
    // Business rule: Dashboard accessible only to owner role
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only firm owners can view dashboard statistics");
    };
    let profile = getCallerProfile(caller);
    let firmId = profile.firmId;

    let firmClients = clients.values().toArray()
      .filter(func(c) { c.firmId == firmId });
    let totalClients = firmClients.size();

    var pendingITR : Nat = 0;
    var inProgressITR : Nat = 0;
    var filedITR : Nat = 0;

    for (wp in workProcessings.values()) {
      if (wp.firmId == firmId) {
        if (wp.filingStatus == "pending") {
          pendingITR += 1;
        } else if (wp.filingStatus == "in_progress") {
          inProgressITR += 1;
        } else if (wp.filingStatus == "filed") {
          filedITR += 1;
        };
      };
    };

    var documentsPending : Nat = 0;
    for (doc in documentInwards.values()) {
      if (doc.firmId == firmId and doc.documentStatus == "pending") {
        documentsPending += 1;
      };
    };

    var readyForDelivery : Nat = 0;
    for (od in outwardDocuments.values()) {
      if (od.firmId == firmId and od.outwardStatus == "ready") {
        readyForDelivery += 1;
      };
    };

    {
      totalClients = totalClients;
      pendingITR = pendingITR;
      inProgressITR = inProgressITR;
      filedITR = filedITR;
      documentsPending = documentsPending;
      readyForDelivery = readyForDelivery;
    };
  };

  // Export function - OWNER ONLY
  public query ({ caller }) func getAllDataForExport() : async ExportData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can export data");
    };
    // Business rule: Export accessible only to owner role
    if (not isOwner(caller)) {
      Runtime.trap("Unauthorized: Only firm owners can export data");
    };
    let profile = getCallerProfile(caller);
    let firmId = profile.firmId;

    {
      clients = clients.values().toArray()
        .filter(func(c) { c.firmId == firmId })
        .sort();
      documents = documentInwards.values().toArray()
        .filter(func(d) { d.firmId == firmId })
        .sort();
      workProcessing = workProcessings.values().toArray()
        .filter(func(wp) { wp.firmId == firmId })
        .sort();
      billing = invoices.values().toArray()
        .filter(func(inv) { inv.firmId == firmId })
        .sort();
    };
  };
};
