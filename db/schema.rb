# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150518201248) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accounts", force: true do |t|
    t.integer  "qb_id"
    t.integer  "sync_token"
    t.string   "name"
    t.integer  "user_id"
    t.integer  "parent_id"
    t.boolean  "sub_account",      default: false
    t.string   "account_type"
    t.string   "account_sub_type"
    t.string   "classification"
    t.integer  "status",           default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "qb_d_id"
    t.boolean  "sync_qb",          default: false
    t.string   "edit_sequence"
    t.boolean  "search_on_qb",     default: false
    t.string   "parent_ref"
    t.integer  "request_number",   default: 0
  end

  add_index "accounts", ["qb_d_id"], name: "index_accounts_on_qb_d_id", using: :btree
  add_index "accounts", ["user_id"], name: "index_accounts_on_user_id", using: :btree

  create_table "active_admin_comments", force: true do |t|
    t.string   "namespace"
    t.text     "body"
    t.string   "resource_id",   null: false
    t.string   "resource_type", null: false
    t.integer  "author_id"
    t.string   "author_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "active_admin_comments", ["author_type", "author_id"], name: "index_active_admin_comments_on_author_type_and_author_id", using: :btree
  add_index "active_admin_comments", ["namespace"], name: "index_active_admin_comments_on_namespace", using: :btree
  add_index "active_admin_comments", ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource_type_and_resource_id", using: :btree

  create_table "addresses", force: true do |t|
    t.string   "name"
    t.string   "address1"
    t.string   "address2"
    t.string   "city"
    t.string   "state"
    t.string   "zip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "addressable_id"
    t.string   "addressable_type"
    t.integer  "created_by",       default: 0
    t.integer  "user_id"
    t.integer  "parent_id"
    t.integer  "qb_class_id"
    t.string   "mt_worker_id"
    t.string   "mt_assignment_id"
    t.string   "mt_hit_id"
  end

  create_table "admin_users", force: true do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "admin_users", ["email"], name: "index_admin_users_on_email", unique: true, using: :btree
  add_index "admin_users", ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true, using: :btree

  create_table "admins", force: true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
  end

  add_index "admins", ["email"], name: "index_admins_on_email", unique: true, using: :btree
  add_index "admins", ["reset_password_token"], name: "index_admins_on_reset_password_token", unique: true, using: :btree

  create_table "alerts", force: true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "alertable_id"
    t.integer  "category"
    t.integer  "invoice_owner_id"
    t.string   "alertable_type"
    t.text     "short_text"
    t.text     "large_text"
    t.decimal  "average"
    t.text     "sms_text"
  end

  add_index "alerts", ["invoice_owner_id"], name: "index_alerts_on_invoice_owner_id", using: :btree

  create_table "approvals", force: true do |t|
    t.string   "kind",        default: "regular", null: false
    t.integer  "invoice_id"
    t.integer  "approver_id"
    t.datetime "approved_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "approvals", ["approver_id"], name: "index_approvals_on_approver_id", using: :btree
  add_index "approvals", ["invoice_id"], name: "index_approvals_on_invoice_id", using: :btree

  create_table "assignments", force: true do |t|
    t.integer  "hit_id"
    t.integer  "worker_id"
    t.integer  "status",           default: 0
    t.string   "mt_assignment_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "assignments", ["hit_id"], name: "index_assignments_on_hit_id", using: :btree
  add_index "assignments", ["mt_assignment_id"], name: "index_assignments_on_mt_assignment_id", using: :btree
  add_index "assignments", ["worker_id"], name: "index_assignments_on_worker_id", using: :btree

  create_table "comments", force: true do |t|
    t.text     "body"
    t.integer  "worker_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "mt_hit_id"
    t.string   "mt_worker_id"
    t.string   "mt_assignment_id"
  end

  create_table "common_alert_settings", force: true do |t|
    t.boolean  "email_new_invoice_onchange",    default: false
    t.boolean  "email_new_invoice_daily",       default: false
    t.boolean  "email_new_invoice_weekly",      default: true
    t.boolean  "email_new_invoice_none",        default: false
    t.boolean  "email_change_invoice_onchange", default: false
    t.boolean  "email_change_invoice_daily",    default: false
    t.boolean  "email_change_invoice_weekly",   default: true
    t.boolean  "email_change_invoice_none",     default: false
    t.boolean  "email_paid_invoice_onchange",   default: false
    t.boolean  "email_paid_invoice_daily",      default: false
    t.boolean  "email_paid_invoice_weekly",     default: true
    t.boolean  "email_paid_invoice_none",       default: false
    t.boolean  "email_savings_onchange",        default: false
    t.boolean  "email_savings_daily",           default: false
    t.boolean  "email_savings_invoice_weekly",  default: true
    t.boolean  "email_savings_invoice_none",    default: false
    t.boolean  "text_new_invoice_onchange",     default: false
    t.boolean  "text_new_invoice_daily",        default: false
    t.boolean  "text_new_invoice_weekly",       default: false
    t.boolean  "text_new_invoice_none",         default: true
    t.boolean  "text_change_invoice_onchange",  default: false
    t.boolean  "text_change_invoice_daily",     default: false
    t.boolean  "text_change_invoice_weekly",    default: false
    t.boolean  "text_change_invoice_none",      default: true
    t.boolean  "text_paid_invoice_onchange",    default: false
    t.boolean  "text_paid_invoice_daily",       default: false
    t.boolean  "text_paid_invoice_weekly",      default: false
    t.boolean  "text_paid_invoice_none",        default: true
    t.boolean  "text_savings_onchange",         default: false
    t.boolean  "text_savings_daily",            default: false
    t.boolean  "text_savings_invoice_weekly",   default: false
    t.boolean  "text_savings_invoice_none",     default: true
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "individual_id"
  end

  add_index "common_alert_settings", ["individual_id"], name: "index_common_alert_settings_on_individual_id", using: :btree

  create_table "dilbert_images", force: true do |t|
    t.string   "title"
    t.string   "link"
    t.string   "guid"
    t.datetime "publication_date"
    t.string   "description"
    t.string   "original_image_url"
    t.string   "image_file_name"
    t.string   "image_content_type"
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "hits", force: true do |t|
    t.integer  "status",                              default: 0
    t.string   "mt_hit_id"
    t.string   "url"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "hit_type",                            default: 0
    t.decimal  "reward",      precision: 8, scale: 2, default: 0.0
    t.integer  "invoice_id"
    t.boolean  "submited",                            default: false
    t.integer  "page_number",                         default: 1
    t.string   "title"
  end

  add_index "hits", ["invoice_id"], name: "index_hits_on_invoice_id", using: :btree
  add_index "hits", ["mt_hit_id"], name: "index_hits_on_mt_hit_id", using: :btree

  create_table "individuals", force: true do |t|
    t.integer  "user_id"
    t.string   "email",                  default: "",     null: false
    t.string   "encrypted_password",     default: "",     null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.integer  "sign_in_count",          default: 0,      null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.integer  "failed_attempts",        default: 0,      null: false
    t.string   "unlock_token"
    t.datetime "locked_at"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "role_id"
    t.string   "name",                   default: "User", null: false
    t.decimal  "limit_min"
    t.decimal  "limit_max"
    t.boolean  "terms_of_service",       default: true
    t.integer  "invited_by"
  end

  add_index "individuals", ["confirmation_token"], name: "index_individuals_on_confirmation_token", unique: true, using: :btree
  add_index "individuals", ["email"], name: "index_individuals_on_email", unique: true, using: :btree
  add_index "individuals", ["invited_by"], name: "index_individuals_on_invited_by", using: :btree
  add_index "individuals", ["reset_password_token"], name: "index_individuals_on_reset_password_token", unique: true, using: :btree
  add_index "individuals", ["role_id"], name: "index_individuals_on_role_id", using: :btree
  add_index "individuals", ["unlock_token"], name: "index_individuals_on_unlock_token", unique: true, using: :btree

  create_table "individuals_permitted_accounts", id: false, force: true do |t|
    t.integer "account_id"
    t.integer "individual_id"
  end

  add_index "individuals_permitted_accounts", ["account_id"], name: "index_individuals_permitted_accounts_on_account_id", using: :btree
  add_index "individuals_permitted_accounts", ["individual_id"], name: "index_individuals_permitted_accounts_on_individual_id", using: :btree

  create_table "individuals_permitted_qb_classes", force: true do |t|
    t.integer "qb_class_id"
    t.integer "individual_id"
  end

  add_index "individuals_permitted_qb_classes", ["individual_id"], name: "index_individuals_permitted_qb_classes_on_individual_id", using: :btree
  add_index "individuals_permitted_qb_classes", ["qb_class_id"], name: "index_individuals_permitted_qb_classes_on_qb_class_id", using: :btree

  create_table "individuals_permitted_vendors", force: true do |t|
    t.integer "vendor_id"
    t.integer "individual_id"
  end

  add_index "individuals_permitted_vendors", ["individual_id"], name: "index_individuals_permitted_vendors_on_individual_id", using: :btree
  add_index "individuals_permitted_vendors", ["vendor_id"], name: "index_individuals_permitted_vendors_on_vendor_id", using: :btree

  create_table "invoice_moderations", force: true do |t|
    t.integer  "invoice_id"
    t.string   "number"
    t.integer  "vendor_id"
    t.decimal  "amount_due"
    t.decimal  "tax"
    t.decimal  "other_fee"
    t.date     "due_date"
    t.date     "date"
    t.integer  "status",          default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "hit_id"
    t.integer  "worker_id"
    t.integer  "assignment_id"
    t.integer  "moderation_type", default: 0
    t.string   "name"
    t.string   "address1"
    t.string   "address2"
    t.string   "city"
    t.string   "state"
    t.string   "zip"
    t.string   "email"
  end

  add_index "invoice_moderations", ["assignment_id"], name: "index_invoice_moderations_on_assignment_id", using: :btree
  add_index "invoice_moderations", ["worker_id"], name: "index_invoice_moderations_on_worker_id", using: :btree

  create_table "invoice_pages", force: true do |t|
    t.integer  "line_items_count"
    t.integer  "page_number"
    t.integer  "worker_id"
    t.integer  "survey_id"
    t.integer  "invoice_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "invoice_transactions", force: true do |t|
    t.integer  "line_item_id"
    t.integer  "invoice_id"
    t.decimal  "quantity",              precision: 8, scale: 2, default: 0.0
    t.decimal  "total",                 precision: 8, scale: 2, default: 0.0
    t.decimal  "price",                 precision: 8, scale: 2, default: 0.0
    t.decimal  "discount",              precision: 8, scale: 2, default: 0.0
    t.integer  "qb_id"
    t.integer  "sync_token"
    t.decimal  "average_price",         precision: 8, scale: 2, default: 0.0
    t.decimal  "average_volume",        precision: 8, scale: 2, default: 0.0
    t.string   "txn_line_id"
    t.integer  "order_number"
    t.boolean  "default_item",                                  default: false
    t.boolean  "automatic_calculation",                         default: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "invoice_transactions", ["invoice_id"], name: "index_invoice_transactions_on_invoice_id", using: :btree
  add_index "invoice_transactions", ["line_item_id"], name: "index_invoice_transactions_on_line_item_id", using: :btree

  create_table "invoices", force: true do |t|
    t.string   "number"
    t.integer  "vendor_id"
    t.decimal  "amount_due"
    t.decimal  "tax"
    t.decimal  "other_fee"
    t.date     "due_date"
    t.string   "resale_number"
    t.string   "account_number"
    t.string   "delivery_address1"
    t.string   "delivery_address2"
    t.string   "delivery_address3"
    t.string   "delivery_city"
    t.string   "delivery_state"
    t.string   "delivery_zip"
    t.date     "date"
    t.boolean  "invoice_total"
    t.boolean  "new_item"
    t.boolean  "line_item_quantity"
    t.boolean  "unit_price"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id"
    t.boolean  "invoice_moderation",       default: false
    t.boolean  "reviewed",                 default: false
    t.string   "pdf_file_name"
    t.string   "pdf_content_type"
    t.integer  "pdf_file_size"
    t.datetime "pdf_updated_at"
    t.date     "payment_send_date"
    t.date     "payment_date"
    t.date     "act_by"
    t.text     "email_body"
    t.integer  "paid_with"
    t.integer  "status",                   default: 1
    t.integer  "source",                   default: 0
    t.integer  "check_number"
    t.date     "check_date"
    t.integer  "qb_id"
    t.integer  "sync_token"
    t.string   "source_email"
    t.date     "deferred_date"
    t.integer  "invoice_survey_id"
    t.boolean  "is_invoice"
    t.boolean  "vendor_present"
    t.boolean  "address_present"
    t.boolean  "amount_due_present"
    t.boolean  "bank_information_present"
    t.integer  "line_items_count"
    t.boolean  "is_marked_through"
    t.boolean  "survey_agreement"
    t.date     "stated_date"
    t.boolean  "processed_by_turk",        default: false
    t.integer  "address_id"
    t.integer  "failed_items"
    t.string   "bank_name"
    t.string   "qb_d_id"
    t.boolean  "sync_qb",                  default: false
    t.string   "edit_sequence"
    t.string   "txn_id"
    t.boolean  "synced_payment",           default: false
    t.boolean  "search_on_qb",             default: false
    t.integer  "txn_number"
    t.boolean  "bill_paid",                default: false
    t.integer  "expense_account_id"
    t.integer  "qb_class_id"
    t.boolean  "has_items",                default: false
    t.boolean  "accountant_approved",      default: false
    t.boolean  "regular_approved",         default: false
    t.integer  "pdf_total_pages",          default: 1
    t.datetime "qb_d_deleted_at"
    t.datetime "resending_payment_at"
    t.datetime "qb_bill_paid_at"
    t.integer  "request_number",           default: 0
    t.string   "bill_payment_txn_id"
    t.boolean  "marked_as_paid",           default: false
  end

  add_index "invoices", ["expense_account_id"], name: "index_invoices_on_expense_account_id", using: :btree
  add_index "invoices", ["invoice_survey_id"], name: "index_invoices_on_invoice_survey_id", using: :btree
  add_index "invoices", ["qb_class_id"], name: "index_invoices_on_qb_class_id", using: :btree
  add_index "invoices", ["qb_d_id"], name: "index_invoices_on_qb_d_id", using: :btree
  add_index "invoices", ["user_id"], name: "index_invoices_on_user_id", using: :btree
  add_index "invoices", ["vendor_id"], name: "index_invoices_on_vendor_id", using: :btree

  create_table "invoices_sms_threads", force: true do |t|
    t.integer  "sms_thread_id"
    t.integer  "invoice_id"
    t.integer  "status",        default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "line_items", force: true do |t|
    t.integer  "quantity"
    t.string   "code"
    t.string   "description"
    t.integer  "invoice_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.decimal  "price",                           precision: 8, scale: 2, default: 0.0
    t.decimal  "total",                           precision: 8, scale: 2, default: 0.0
    t.integer  "worker_id"
    t.integer  "created_by",                                              default: 0
    t.string   "mt_worker_id"
    t.string   "mt_hit_id"
    t.string   "mt_assignment_id"
    t.decimal  "discount",                        precision: 8, scale: 2, default: 0.0
    t.integer  "qb_id"
    t.integer  "sync_token"
    t.integer  "liability_account_id"
    t.integer  "expense_account_id"
    t.decimal  "average_price"
    t.decimal  "average_volume"
    t.integer  "qb_class_id"
    t.string   "qb_d_id"
    t.boolean  "sync_qb",                                                 default: false
    t.string   "edit_sequence"
    t.boolean  "search_on_qb",                                            default: false
    t.boolean  "selected_from_default_expense",                           default: false
    t.boolean  "selected_from_default_liability",                         default: false
    t.string   "txn_line_id"
    t.integer  "vendor_id"
    t.boolean  "uniq_item",                                               default: false
    t.decimal  "total_transactions",                                      default: 0.0,   null: false
    t.boolean  "default_item",                                            default: false
    t.decimal  "last_price",                      precision: 8, scale: 2, default: 0.0
  end

  add_index "line_items", ["invoice_id"], name: "index_line_items_on_invoice_id", using: :btree
  add_index "line_items", ["mt_hit_id"], name: "index_line_items_on_mt_hit_id", using: :btree
  add_index "line_items", ["qb_d_id"], name: "index_line_items_on_qb_d_id", using: :btree
  add_index "line_items", ["vendor_id"], name: "index_line_items_on_vendor_id", using: :btree
  add_index "line_items", ["worker_id"], name: "index_line_items_on_worker_id", using: :btree

  create_table "numbers", force: true do |t|
    t.string   "string"
    t.integer  "individual_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "selected",      default: false
  end

  add_index "numbers", ["individual_id"], name: "index_numbers_on_individual_id", using: :btree

  create_table "payments", force: true do |t|
    t.integer  "qb_id"
    t.integer  "sync_token"
    t.date     "date"
    t.integer  "vendor_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "qb_classes", force: true do |t|
    t.integer  "sync_token"
    t.string   "metadata"
    t.boolean  "sub_class",                      default: false
    t.integer  "qb_parent_id",         limit: 8
    t.string   "fully_qualified_name"
    t.boolean  "active",                         default: true
    t.integer  "user_id"
    t.integer  "qb_id",                limit: 8
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "qb_d_id"
    t.boolean  "sync_qb",                        default: false
    t.string   "edit_sequence"
    t.boolean  "search_on_qb",                   default: false
    t.string   "parent_ref"
  end

  add_index "qb_classes", ["qb_d_id"], name: "index_qb_classes_on_qb_d_id", using: :btree
  add_index "qb_classes", ["user_id"], name: "index_qb_classes_on_user_id", using: :btree

  create_table "qbwc_jobs", force: true do |t|
    t.string   "name"
    t.string   "company",                          limit: 1000
    t.string   "worker_class",                     limit: 100
    t.boolean  "enabled",                                       default: false, null: false
    t.integer  "request_index",                                 default: 0,     null: false
    t.text     "requests"
    t.boolean  "requests_provided_when_job_added",              default: false, null: false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "qbwc_sessions", force: true do |t|
    t.string   "ticket"
    t.string   "user"
    t.string   "company",      limit: 1000
    t.integer  "progress",                  default: 0,  null: false
    t.string   "current_job"
    t.string   "iterator_id"
    t.string   "error",        limit: 1000
    t.string   "pending_jobs", limit: 1000, default: "", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "responses", force: true do |t|
    t.integer  "worker_id"
    t.string   "field_name"
    t.string   "field_response"
    t.integer  "trackable_id"
    t.string   "trackable_type"
    t.integer  "status",            default: 0
    t.integer  "assignment_id"
    t.string   "expected_response"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "roles", force: true do |t|
    t.integer  "user_id"
    t.string   "name",                     null: false
    t.string   "permissions", default: [],              array: true
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "roles", ["user_id"], name: "index_roles_on_user_id", using: :btree

  create_table "sms_messages", force: true do |t|
    t.integer  "sms_thread_id"
    t.integer  "number_id"
    t.string   "text"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "message_type",  default: 0
    t.integer  "alert_id"
  end

  add_index "sms_messages", ["number_id"], name: "index_sms_messages_on_number_id", using: :btree
  add_index "sms_messages", ["sms_thread_id"], name: "index_sms_messages_on_sms_thread_id", using: :btree

  create_table "sms_threads", force: true do |t|
    t.integer  "thread_type"
    t.integer  "user_id"
    t.integer  "invoice_id"
    t.integer  "number_id"
    t.integer  "status",      default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sms_threads", ["invoice_id"], name: "index_sms_threads_on_invoice_id", using: :btree
  add_index "sms_threads", ["user_id"], name: "index_sms_threads_on_user_id", using: :btree

  create_table "surveys", force: true do |t|
    t.boolean  "is_invoice"
    t.boolean  "vendor_present"
    t.boolean  "address_present"
    t.boolean  "amount_due_present"
    t.boolean  "is_marked_through"
    t.integer  "invoice_id"
    t.integer  "worker_id"
    t.string   "mt_hit_id"
    t.string   "mt_assignment_id"
    t.string   "mt_worker_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "address_reference"
    t.integer  "assignment_id"
  end

  add_index "surveys", ["assignment_id"], name: "index_surveys_on_assignment_id", using: :btree
  add_index "surveys", ["invoice_id"], name: "index_surveys_on_invoice_id", using: :btree

  create_table "trigrams", force: true do |t|
    t.string  "trigram",     limit: 3
    t.integer "score",       limit: 2
    t.integer "owner_id"
    t.string  "owner_type"
    t.string  "fuzzy_field"
  end

  add_index "trigrams", ["owner_id", "owner_type", "fuzzy_field", "trigram", "score"], name: "index_for_match", using: :btree
  add_index "trigrams", ["owner_id", "owner_type"], name: "index_by_owner", using: :btree

  create_table "turk_transactions", force: true do |t|
    t.string   "code"
    t.string   "description"
    t.decimal  "quantity",                 precision: 8, scale: 2, default: 0.0
    t.decimal  "price",                    precision: 8, scale: 2, default: 0.0
    t.decimal  "discount",                 precision: 8, scale: 2, default: 0.0
    t.decimal  "total",                    precision: 8, scale: 2, default: 0.0
    t.integer  "worker_id"
    t.integer  "assignment_id"
    t.integer  "hit_id"
    t.integer  "invoice_id"
    t.boolean  "pay_for_this_transactino",                         default: false
    t.boolean  "matched",                                          default: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "uploads", force: true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image_file_name"
    t.string   "image_content_type"
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
    t.integer  "invoice_id"
    t.boolean  "only_png",           default: false
  end

  create_table "users", force: true do |t|
    t.string   "invite_code"
    t.string   "mobile_phone"
    t.string   "routing_number"
    t.string   "bank_account_number"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "default_due_date",              default: 14
    t.string   "timezone"
    t.string   "business_name"
    t.string   "business_type"
    t.string   "billing_address1"
    t.string   "billing_address2"
    t.string   "billing_city"
    t.string   "billing_state"
    t.string   "billing_zip"
    t.string   "qb_token"
    t.string   "qb_secret"
    t.string   "realm_id"
    t.datetime "token_expires_at"
    t.datetime "reconnect_token_at"
    t.integer  "check_number",                  default: 8000000, null: false
    t.integer  "liability_account_id"
    t.integer  "expense_account_id"
    t.binary   "encrypted_bank_account_number"
    t.binary   "encrypted_routing_number"
    t.integer  "bank_account_id"
    t.integer  "sms_time",                      default: 11
    t.boolean  "pay_bills_through_text",        default: true
    t.boolean  "first_bill_added",              default: false
    t.boolean  "pay_first_bill",                default: false
    t.boolean  "modal_used",                    default: false
    t.boolean  "locations_feature"
    t.integer  "default_class_id"
    t.boolean  "sync_with_qb_d",                default: false
    t.boolean  "synced_qb",                     default: false
    t.string   "file_password"
    t.string   "qb_company_name"
    t.boolean  "authorized_to_sync",            default: false
    t.string   "qb_wrong_company"
    t.datetime "last_qb_sync"
    t.text     "signature"
    t.datetime "signature_created_at"
    t.integer  "veified_user",                  default: 0
    t.decimal  "first_amount_verification"
    t.decimal  "second_amount_verification"
    t.integer  "verification_attempts",         default: 1
    t.integer  "verification_status",           default: 0
    t.integer  "sync_count",                    default: 0
    t.string   "doing_business_as"
    t.date     "ach_date"
  end

  create_table "vendor_alert_settings", force: true do |t|
    t.integer  "vendor_id"
    t.boolean  "alert_total_text",              default: false
    t.boolean  "alert_total_email",             default: false
    t.boolean  "alert_total_flag",              default: true
    t.boolean  "alert_item_text",               default: false
    t.boolean  "alert_item_email",              default: false
    t.boolean  "alert_item_flag",               default: true
    t.boolean  "alert_itemqty_text",            default: false
    t.boolean  "alert_itemqty_email",           default: false
    t.boolean  "alert_itemqty_flag",            default: true
    t.boolean  "alert_itemprice_text",          default: false
    t.boolean  "alert_itemprice_email",         default: false
    t.boolean  "alert_itemprice_flag",          default: true
    t.boolean  "alert_duplicate_invoice_text",  default: false
    t.boolean  "alert_duplicate_invoice_email", default: false
    t.boolean  "alert_duplicate_invoice_flag",  default: true
    t.boolean  "alert_marked_through_text",     default: false
    t.boolean  "alert_marked_through_email",    default: false
    t.boolean  "alert_marked_through_flag",     default: true
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "individual_id"
  end

  add_index "vendor_alert_settings", ["individual_id"], name: "index_vendor_alert_settings_on_individual_id", using: :btree
  add_index "vendor_alert_settings", ["vendor_id"], name: "index_vendor_alert_settings_on_vendor_id", using: :btree

  create_table "vendors", force: true do |t|
    t.integer  "user_id"
    t.string   "default_class"
    t.string   "name"
    t.string   "address1"
    t.string   "address2"
    t.string   "address3"
    t.string   "city"
    t.string   "state"
    t.string   "zip"
    t.string   "country"
    t.string   "fax_number"
    t.string   "cell_number"
    t.string   "email"
    t.string   "tax_id_number"
    t.integer  "after_bill_date"
    t.integer  "before_due_date",                            default: 1
    t.integer  "after_due_date",                             default: 1
    t.integer  "day_of_the_month"
    t.integer  "after_recieved"
    t.decimal  "auto_amount"
    t.integer  "end_after_payments"
    t.decimal  "end_autopay_over_amount"
    t.decimal  "alert_over"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "contact_person"
    t.string   "business_number"
    t.string   "payment_end_exceed"
    t.string   "payment_end_payments"
    t.string   "payment_end_date"
    t.string   "payment_amount_fixed"
    t.integer  "pay_day"
    t.date     "payment_date"
    t.integer  "payment_term",                               default: 1
    t.integer  "payment_end",                                default: 0
    t.integer  "payment_amount",                             default: 0
    t.string   "routing_number"
    t.string   "bank_account_number"
    t.integer  "created_by",                                 default: 0
    t.integer  "sync_token"
    t.integer  "qb_id"
    t.string   "qb_account_number"
    t.integer  "liability_account_id"
    t.integer  "expense_account_id"
    t.integer  "auto_pay_weekly",                            default: 1
    t.boolean  "payment_end_if_alert",                       default: true
    t.binary   "encrypted_bank_account_number"
    t.binary   "encrypted_routing_number"
    t.integer  "payment_status",                             default: 0
    t.boolean  "keep_due_date",                              default: false
    t.integer  "default_qb_class_id"
    t.integer  "parent_id"
    t.integer  "source",                                     default: 0
    t.boolean  "update_to_quickbooks",                       default: false
    t.string   "qb_d_id"
    t.boolean  "sync_qb",                                    default: false
    t.boolean  "search_on_qb",                               default: false
    t.string   "edit_sequence"
    t.boolean  "selected_from_default_expense",              default: false
    t.boolean  "selected_from_default_liability",            default: false
    t.string   "qb_d_name",                       limit: 41
    t.integer  "status",                                     default: 0
    t.string   "comparation_string"
    t.integer  "request_number",                             default: 0
  end

  add_index "vendors", ["name"], name: "index_vendors_on_name", using: :btree
  add_index "vendors", ["parent_id"], name: "index_vendors_on_parent_id", using: :btree
  add_index "vendors", ["qb_d_id"], name: "index_vendors_on_qb_d_id", using: :btree

  create_table "versions", force: true do |t|
    t.string   "item_type",      null: false
    t.integer  "item_id",        null: false
    t.string   "event",          null: false
    t.string   "whodunnit"
    t.text     "object"
    t.datetime "created_at"
    t.text     "object_changes"
  end

  add_index "versions", ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id", using: :btree

  create_table "worker_messages", force: true do |t|
    t.string   "body"
    t.string   "subject"
    t.integer  "worker_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "mt_worker_id"
  end

  create_table "workers", force: true do |t|
    t.string   "mt_worker_id"
    t.integer  "training_level"
    t.decimal  "earning",                      precision: 8, scale: 2, default: 0.0
    t.decimal  "earning_rate",                 precision: 8, scale: 2, default: 0.0
    t.integer  "score",                                                default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "status",                                               default: 0
    t.integer  "block_counter",                                        default: 0
    t.integer  "worker_level",                                         default: 0
    t.integer  "blank_submission_counter",                             default: 0
    t.datetime "grant_time"
    t.datetime "warning_notification_sent_at"
    t.boolean  "notifications_disabled",                               default: false
    t.datetime "blocked_at"
  end

  add_index "workers", ["mt_worker_id"], name: "index_workers_on_mt_worker_id", using: :btree

end
