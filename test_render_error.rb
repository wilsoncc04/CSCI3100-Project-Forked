class Dummy
  def self.full_messages
    ["foo", "bar"]
  end
end
p Dummy.respond_to?(:full_messages)
