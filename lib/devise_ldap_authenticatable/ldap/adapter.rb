require "net/ldap"

module Devise
  module LDAP
    DEFAULT_GROUP_UNIQUE_MEMBER_LIST_KEY = 'uniqueMember'

    module Adapter

      # Da function.
      # Va checker les identifiants sur chaque serveur. Si un serveur bind,
      # la methode retourne vrai sans tester les autres serveurs.
      def self.valid_credentials?(login, password_plaintext)
        options = {:login => login,
                   :password => password_plaintext,
                   :ldap_auth_username_builder => ::Devise.ldap_auth_username_builder,
                   :admin => ::Devise.ldap_use_admin_to_bind}
        puts "[Devise::LDAP:Adapter::valid_credentials? (#{login}, #{password_plaintext})]"
        self.roll_authentifications options do |resource|
          if resource.authorized? === true
            return true
          end
        end
        false
      end

      # Une petit statique utilitaire qui va bous permettre d'itérer
      # sur chaque credential du fichier de config.
      def self.roll_authentifications(options)
        config = self.load_config
        config.each do |namespace, conf|
          resource = Devise::LDAP::Connection.new(options, conf)
          yield resource
        end
      end

      def self.update_password(login, new_password)
        options = {:login => login,
                   :new_password => new_password,
                   :ldap_auth_username_builder => ::Devise.ldap_auth_username_builder,
                   :admin => ::Devise.ldap_use_admin_to_bind}

        self.roll_authentifications options do |resource|
          resource.change_password! if new_password.present?
        end
      end

      def self.update_own_password(login, new_password, current_password)
        set_ldap_param(login, :userPassword, ::Devise.ldap_auth_password_builder.call(new_password), current_password)
      end

      # Va se connecter au premier ldap valide (sur lequel le login bind).
      # Si aucun serveur est bindable, va retourner le premier de la liste.
      def self.ldap_connect(login)
        options = {:login => login,
                   :ldap_auth_username_builder => ::Devise.ldap_auth_username_builder,
                   :admin => ::Devise.ldap_use_admin_to_bind}

        self.roll_authentifications options do |resource|
          return resource if resource.valid_login?
        end
        self.roll_authentifications options do |resource|
          return resource
        end
      end

      # Va se connecter avec password au premier ldap valide (sur lequel le login bind).
      # Si aucun serveur est bindable, va retourner le premier de la liste.
      def self.ldap_secure_connect(login, password_plaintext)
        options = {:login => login,
                   :password => password_plaintext,
                   :ldap_auth_username_builder => ::Devise.ldap_auth_username_builder,
                   :admin => ::Devise.ldap_use_admin_to_bind}

        self.roll_authentifications options do |resource|
          return resource if resource.valid_login?
        end
        self.roll_authentifications options do |resource|
          return resource
        end
      end

      def self.valid_login?(login)
          self.ldap_connect(login).valid_login?
      end

      def self.get_groups(login)
        self.ldap_connect(login).user_groups
      end

      def self.in_ldap_group?(login, group_name, group_attribute = nil)

        options = {:login => login,
                   :ldap_auth_username_builder => ::Devise.ldap_auth_username_builder,
                   :admin => ::Devise.ldap_use_admin_to_bind}

        self.roll_authentifications options do |resource|
          return true if resource.in_group?(group_name, group_attribute)
        end
        false
      end

      def self.get_dn(login)
        self.ldap_connect(login).dn
      end

      def self.set_ldap_param(login, param, new_value, password = nil)
        self.ldap_connect(login).set_param(param, new_value)
      end

      def self.delete_ldap_param(login, param, password = nil)
        self.ldap_connect(login).delete_param(param)
      end

      def self.get_secure_ldap_param(login, password, param)
        resource = self.ldap_secure_connect(login, password).ldap_param_value(param)
      end

      def self.get_full(login, password_plaintext)
        options = {:login => login,
                   :password => password_plaintext,
                   :ldap_auth_username_builder => ::Devise.ldap_auth_username_builder,
                   :admin => ::Devise.ldap_use_admin_to_bind}
        puts "[Devise::LDAP:Adapter::valid_credentials? (#{login}, #{password_plaintext})]"
        self.roll_authentifications options do |resource|
          if resource.authorized? === true
            return resource
          end
        end
        false
      end

      def self.get_ldap_param(login, param)
        resource = self.ldap_connect(login).ldap_param_value(param)
      end

      def self.get_ldap_entry(login)
        self.ldap_connect(login).search_for_login
      end

      # Va charger les credentials LDAP dans une variable de classe
      def self.load_config()
        @@ldap_config ||= YAML.load(ERB.new(File.read(::Devise.ldap_config || "#{Rails.root}/config/ldap.yml")).result)[Rails.env]
      end

    end

  end

end
