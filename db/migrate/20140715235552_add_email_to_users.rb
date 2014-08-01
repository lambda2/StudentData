class AddEmailToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :email, default: "", null: false
    end
  end
end
