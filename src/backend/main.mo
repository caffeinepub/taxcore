import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {

  // ─── Legacy stable variables (kept for upgrade compatibility) ─────────────
  // These match the stable variable names from the previous canister version.
  // They must be declared here so Motoko does not treat them as discarded.
  // They are no longer used — all data is now stored in globalUserDb/globalAppData.

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    role : Text;
    email : Text;
    firmId : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let firmOwners = Map.empty<Text, Principal>();
  let firmClientCounts = Map.empty<Text, Nat>();
  let trialModeFirms = Map.empty<Text, Bool>();

  type ClientId = Nat;
  type DocumentInwardId = Nat;
  type WorkProcessingId = Nat;
  type OutwardDocumentId = Nat;
  type InvoiceId = Nat;
  type ActivityLogId = Nat;

  type Client = {
    id : ClientId; name : Text; pan : Text; mobile : Text; email : Text;
    clientType : Text; sourceOfIncome : Text; createdAt : Int;
    createdBy : Text; firmId : Text;
  };
  type DocumentInward = {
    id : DocumentInwardId; clientId : ClientId; dateOfReceipt : Text;
    mode : Text; documentStatus : Text; remarks : Text; firmId : Text;
  };
  type WorkProcessing = {
    id : WorkProcessingId; clientId : ClientId; filingStatus : Text;
    itrFormType : Text; ackNumber : Text; dateOfFiling : Text;
    dueDateOfFiling : Text; firmId : Text;
  };
  type OutwardDocument = {
    id : OutwardDocumentId; clientId : ClientId; outwardStatus : Text;
    readyDate : Text; firmId : Text;
  };
  type Invoice = {
    id : InvoiceId; clientId : ClientId; invoiceNumber : Text; amount : Nat;
    generatedAt : Int; generatedBy : Text; paid : Bool; firmId : Text;
  };
  type ActivityLog = {
    id : ActivityLogId; timestamp : Int; userId : Text; userName : Text;
    role : Text; action : Text; details : Text; clientId : Text; firmId : Text;
  };

  let clients = Map.empty<ClientId, Client>();
  let documentInwards = Map.empty<DocumentInwardId, DocumentInward>();
  let workProcessings = Map.empty<WorkProcessingId, WorkProcessing>();
  let outwardDocuments = Map.empty<OutwardDocumentId, OutwardDocument>();
  let invoices = Map.empty<InvoiceId, Invoice>();
  let activityLogs = Map.empty<ActivityLogId, ActivityLog>();

  var nextClientId : ClientId = 1;
  var nextDocumentInwardId : DocumentInwardId = 1;
  var nextWorkProcessingId : WorkProcessingId = 1;
  var nextOutwardDocumentId : OutwardDocumentId = 1;
  var nextInvoiceId : InvoiceId = 1;
  var nextActivityLogId : ActivityLogId = 1;

  // ─── Global data blobs ───────────────────────────────────────────────────────
  // All TaxCore data now flows through two global JSON text variables.
  // Any browser or device reads the same blobs — no per-caller identity needed.

  // Stores: users, firmAccounts, superAdminCreated, whatsAppSettings
  var globalUserDb : Text = "";

  // Stores: clients, documents, work, billing, auditLogs
  var globalAppData : Text = "";

  // ─── User database API ───────────────────────────────────────────────────────

  public query func getGlobalUserDatabase() : async Text {
    globalUserDb;
  };

  public shared func saveGlobalUserDatabase(json : Text) : async () {
    globalUserDb := json;
  };

  // ─── App data API ────────────────────────────────────────────────────────────

  public query func getGlobalAppData() : async Text {
    globalAppData;
  };

  public shared func saveGlobalAppData(json : Text) : async () {
    globalAppData := json;
  };

};
