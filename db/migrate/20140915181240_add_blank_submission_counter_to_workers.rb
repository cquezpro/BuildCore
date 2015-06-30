class AddBlankSubmissionCounterToWorkers < ActiveRecord::Migration
  def change
    add_column :workers, :blank_submission_counter, :integer, default: 0
  end
end
