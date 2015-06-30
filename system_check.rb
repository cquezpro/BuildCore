#!/usr/bin/env ruby

require "open3"

CHECKS = [
  ["Ghostscript", "gs -v", /Ghostscript 9\.\d\d/], # at least 9.10
  ["ImageMagick", "convert -version", /ImageMagick/],
  ["Redis", "redis-server -v", /Redis server v=2\./],
  ["Ruby", "ruby -v"],
  ["Node JS", "node -v"],
  ["NPM", "npm -v"],
  ["Grunt", "grunt --version"],
  ["Bower", "bower --version"],
  ["Karma", "karma --version"],
]

def check_failed description, command, reason
  puts "  FAIL: #{description}"
  puts
  puts "`#{command}` failed"
  reason = reason.join("\n") if reason.kind_of? Array
  puts reason
  false
end

def check_succeeded description
  puts "    OK: #{description}"
  true
end

def check_perform description, command, expectations
  out, err, status = Open3.capture3 command
  Thread.sleep 0.05 while !status.exited? && !status.signaled?

  if !status.success?
    msg = [
      "EXITCODE: #{status.exitstatus}",
      "  STDERR: #{err}",
      "   STDIN: #{out}",
    ]

    check_failed description, command, msg
  elsif status.success? && (failing = expectations.detect{ |e| !(e === out) })
    msg = ["#{failing.inspect} expected in:", out]
    check_failed description, command, msg
  else
    check_succeeded command
  end
rescue SystemCallError => e
  check_failed description, command, e.message
end

failed = CHECKS.reject do |description, command, *expectations|
  check_perform description, command, expectations
end

exit(failed.empty? ? 0 : 1)
