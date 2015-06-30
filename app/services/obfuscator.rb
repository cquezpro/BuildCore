class Obfuscator

  def obfuscate string
    if string.length >= 9
      "#" * (string.length - 3) + string[-3..-1]
    elsif !string.empty?
      "#" * 8 + string[-1]
    else
      string
    end
  end
  alias_method :call, :obfuscate

end
