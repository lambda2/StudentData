require 'devise_ldap_authenticatable/strategy'

module Devise
  module Models
    # LDAP Module, responsible for validating the user credentials via LDAP.
    #
    # Examples:
    #
    #    User.authenticate('email@test.com', 'password123')  # returns authenticated user or nil
    #    User.find(1).valid_password?('password123')         # returns true/false
    #
    module LdapAnyAuthenticatable
      extend ActiveSupport::Concern
      include ::Ldap42Base::Components

      included do
        attr_reader :current_password, :password
        attr_accessor :password_confirmation
      end

      module ClassMethods
        # Find a user for ldap authentication.
        def find_for_ldap_authentication(attributes={})
          puts "find_for_ldap_authentication: #{attributes}"
          auth_key = self.authentication_keys.first
          return nil unless attributes[auth_key].present?

          auth_key_value = (self.case_insensitive_keys || []).include?(auth_key) ? attributes[auth_key].downcase : attributes[auth_key]
	  auth_key_value = (self.strip_whitespace_keys || []).include?(auth_key) ? auth_key_value.strip : auth_key_value

          resource = where(auth_key => auth_key_value).first

          if resource.blank? && ::Devise.ldap_create_user
            resource = new
            resource[auth_key] = auth_key_value
            resource.password = attributes[:password]
          end

          if resource && resource.new_record? && resource.valid_ldap_authentication?(attributes[:password])
            resource.ldap_before_save if resource.respond_to?(:ldap_before_save)
            puts "✓ #{resource.login} is an user on the rocks"

            # On récupere toute la data
            r = Devise::LDAP::Adapter.get_full(resource.login, attributes[:password])

            # On check si l'user est staff ou student
            user_type = ("DC=staff".in?(r.dn.to_s) ? :staff : :student)

            # Si le modele a un champ [account_type], on y met le type de compte
            resource.account_type = user_type if resource.has_attribute? :account_type

            # En fonction du type de compte, on cherche l'email a des endrois differents
            if user_type == :student
              resource.email = r.ldap_param_value("alias").try(:first).to_s
            else
              ["email", "userprincipalname"].each do |field|
                resource.email = r.ldap_param_value(field).to_s
                break unless resource.email.blank?
              end
            end
            resource.save! unless resource.email.blank?
          end

          resource
        end

        def update_with_password(resource)
          puts "UPDATE_WITH_PASSWORD: #{resource.inspect}"
        end

      end
    end
  end
end
