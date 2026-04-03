class User < ApplicationRecord
    # Associations
    has_many :bought_products, class_name: 'Product', foreign_key: 'buyer_id', dependent: :nullify
    has_many :selling_products, class_name: 'Product', foreign_key: 'seller_id', dependent: :nullify

    has_many :seller_chats, class_name: 'Chat', foreign_key: 'seller_id', dependent: :destroy
    has_many :buyer_chats, class_name: 'Chat', foreign_key: 'interested_id', dependent: :destroy

    has_many :interests, class_name: 'Interest', foreign_key: 'interested_id', dependent: :destroy
    has_many :community_items, dependent: :destroy

    has_one_attached :profile_picture
    # Authentication, turn on after test
    # virtual attribute: password, handled by has_secure_password
    # can be used by authenticate()
    has_secure_password validations: true

    # Verification helpers (OTP)
    before_create :generate_verification_otp!

    validates :email, presence: true, uniqueness: true
    # Enforce CUHK student email format for registration (1155XXXXXX@link.cuhk.edu.hk)
    CUHK_EMAIL_REGEX = /\A1155\d{6}@link\.cuhk\.edu\.hk\z/
    validates :email, format: { with: CUHK_EMAIL_REGEX }, if: -> { email.present? }

    VERIFICATION_TTL = 24.hours

    # Scopes
    scope :admins, -> { where(is_admin: true) }

    def generate_verification_otp!
        # 6-digit numeric OTP (zero-padded)
        self.verification_otp = rand(0..999999).to_s.rjust(6, '0')
        self.verification_sent_at = Time.current
    end

    def verify_otp!(otp)
        return false if verification_otp.blank? || verification_sent_at.blank?
        return false if verification_sent_at < VERIFICATION_TTL.ago
        return false unless ActiveSupport::SecurityUtils.secure_compare(verification_otp.to_s, otp.to_s)

        # update verified_at and clear OTP fields
        update(verified_at: Time.current, verification_otp: nil, verification_sent_at: nil)
    end

    alias_attribute :hall, :hostel
end
