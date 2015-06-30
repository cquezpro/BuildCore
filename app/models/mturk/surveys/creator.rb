class Mturk::Surveys::Creator < Survey
  include Mturk::Concerns::Normalizer

  validates :mt_hit_id, :mt_worker_id,
            :mt_assignment_id, :invoice_id, :worker_id, presence: true

  def self.create_surveys_with(params)
    return false unless params[:surveys].present?
    return false unless hit = Hit.find_by(mt_hit_id: params[:mt_hit_id])

    worker = Worker.find_or_create_by(mt_worker_id: params[:mt_worker_id])
    assignment = Mturk::Assignments::Creator.build_from(params[:mt_assignment_id], worker, hit)
    assignment.save

    params[:surveys].each do |survey_params|
      this_params = survey_params
      this_params.merge!({
        worker_id: worker.id, mt_hit_id: params[:mt_hit_id],
        mt_assignment_id: params[:mt_assignment_id], mt_worker_id: params[:mt_worker_id],
        assignment_id: assignment.id
      })

      invoice_pages = this_params[:invoice_pages]
      invoice_pages.each {|e| e[:worker_id] = worker.id }
      this_params.merge!({invoice_pages_attributes: invoice_pages } )
      this_params.delete(:invoice_pages)
      survey = create(this_params)
      next unless survey.invoice.surveys.count >= 2 && survey.persisted?

      async_params = {
        mt_hit_id: params[:mt_hit_id],
        invoice_id: survey.invoice.id
      }
      SurveysWorker.delay_for(1.minute).perform_async(async_params)
    end

  end
end
