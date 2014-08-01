module Ldap42Base

  module Components
    def login_with
      @login_with ||= Devise.mappings.find {|k,v| v.class_name == self.class.name}.last.to.authentication_keys.first
      self[@login_with]
    end

    def change_password!(current_password)
      raise "Need to set new password first" if @password.blank?

      Devise::LDAP::Adapter.update_own_password(login_with, @password, current_password)
    end

    def reset_password!(new_password, new_password_confirmation)
      if new_password == new_password_confirmation && ::Devise.ldap_update_password
        Devise::LDAP::Adapter.update_password(login_with, new_password)
      end
      clear_reset_password_token if valid?
      save
    end

    def password=(new_password)
      @password = new_password
      if defined?(password_digest) && @password.present? && respond_to?(:encrypted_password=)
        self.encrypted_password = password_digest(@password)
      end
    end

    # Checks if a resource is valid upon authentication.
    def valid_ldap_authentication?(password)
      Devise::LDAP::Adapter.valid_credentials?(login_with, password)
    end

    def ldap_entry
      @ldap_entry ||= Devise::LDAP::Adapter.get_ldap_entry(login_with)
    end

    def ldap_groups
      Devise::LDAP::Adapter.get_groups(login_with)
    end

    def in_ldap_group?(group_name, group_attribute = LDAP::DEFAULT_GROUP_UNIQUE_MEMBER_LIST_KEY)
      Devise::LDAP::Adapter.in_ldap_group?(login_with, group_name, group_attribute)
    end

    def ldap_dn
      ldap_entry ? ldap_entry.dn : nil
    end

    def ldap_get_param(param)
      if ldap_entry && !ldap_entry[param].empty?
        value = ldap_entry.send(param)
      else
        nil
      end
    end

    #
    # callbacks
    #

    # # Called before the ldap record is saved automatically
    # def ldap_before_save
    # end

    # Called after a successful LDAP authentication
    def after_ldap_authentication
    end
  end
end
