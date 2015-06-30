class DateCalculatorService
  attr_accessor :date

  def initialize(date, days)
    @date = days.business_days.before(date)
  end

  def calculate!
    if [Date.today.monday?, Date.today.thursday?].any?
      comparation_date = Time.zone.now.hour > 13 ? Date.tomorrow : Date.today
    else
      comparation_date = Date.today
    end
    symbol = comparation_date > date ? :+ : :-
    i = 0
    time = Time.zone.now.hour > 13

    until ((comparation_date <= date && !time) || (comparation_date < date && time)) && [date.monday?, date.thursday?].any? do #
      self.date = date.send(symbol, 1.day)
      i += 1

      if i > 3
        symbol = :+
      end
    end
    date
  end
end
