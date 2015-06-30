class AddSurveyAgreementToInvoices < ActiveRecord::Migration
  def change
    add_column :invoices, :survey_agreement, :boolean
  end
end
