class Mturk::Assignments::Creator < Assignment
  validates :mt_assignment_id, :worker_id, :hit_id, presence: true

  def self.build_from(mt_assignment_id, worker, hit)
    builder = find_or_create_by(mt_assignment_id: mt_assignment_id)
    builder.hit = hit
    builder.worker = worker

    builder
  end
end
