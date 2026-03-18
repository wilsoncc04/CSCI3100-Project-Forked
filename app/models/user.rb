class User < ApplicationRecord
    # Associations (existing simplified ones preserved)
    has_many :buyer, class_name: 'Product', foreign_key: 'buyer_id'
    has_many :seller, class_name: 'Product', foreign_key: 'seller_id'

    has_many :sales, class_name: 'Chat', foreign_key: 'seller_id'
    has_many :interested, class_name: 'Chat', foreign_key: 'interested_id'

    has_many :interested, class_name: 'Interest', foreign_key: 'interested_id'
    # Authentication
    has_secure_password validations: false

    # Verification/token helpers
    before_create :generate_verification_token!

    validates :email, presence: true, uniqueness: true
    # Enforce CUHK student email format for registration (1155XXXXXX@link.cuhk.edu.hk)
    CUHK_EMAIL_REGEX = /\A1155\d{6}@link\.cuhk\.edu\.hk\z/
    validates :email, format: { with: CUHK_EMAIL_REGEX }, if: -> { email.present? }

    def generate_verification_token!
        self.verification_token = SecureRandom.urlsafe_base64(24)
    end

    def verify!(token)
        return false unless self.verification_token.present? && ActiveSupport::SecurityUtils.secure_compare(self.verification_token, token)

        update(verified_at: Time.current, verification_token: nil)
    end
end
