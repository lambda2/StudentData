require 'devise/strategies/authenticatable'
require 'devise_ldap_authenticatable/ldap_42_base'

module Devise
  module Strategies
    class LdapAnyAuthenticatable < Authenticatable
      def authenticate!
        resource = mapping.to.find_for_ldap_authentication(authentication_hash.merge(password: password))

        if resource && validate(resource) { resource.valid_ldap_authentication?(password) }
          resource.after_ldap_authentication
          success!(resource)
        else
          return fail(:invalid)
        end

      end
    end

    class LdapStudentAuthenticatable < LdapAnyAuthenticatable
    end

    class LdapStaffAuthenticatable < LdapAnyAuthenticatable
    end
  end
end

Warden::Strategies.add(:ldap_any_authenticatable, Devise::Strategies::LdapAnyAuthenticatable)
Warden::Strategies.add(:ldap_student_authenticatable, Devise::Strategies::LdapStudentAuthenticatable)
Warden::Strategies.add(:ldap_staff_authenticatable, Devise::Strategies::LdapStaffAuthenticatable)
