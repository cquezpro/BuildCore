#other  (4) Change payments to be 5 cents for the first 10, 5 cents for every
# 10 after (paid as a bonus at the end of the day) - so basically for each
# additional 2 we pay 1 cent more.  if there are 3 more we pay 1 cent (round
# down). class Some

class Mturk::Workers::BonusCalculator < ActiveType::Object

  attribute :bonus, :decimal, default: BigDecimal.new(0)
  attribute :matchs, :integer, default: 0

  before_save :calculate_bonus!

  def self.calculate(i)
    instance = new({matchs: i})
    instance.save
    instance.bonus
  end

  private

  def calculate_bonus!
    return unless matchs > 10
    max = matchs <= 10 ? matchs : 10
    self.bonus += BigDecimal.new("0.05")

    return unless matchs > 10
    max = matchs / 10 - 1

    return unless max > 0

    self.bonus += BigDecimal.new(max * 5) / 100
  end
end
