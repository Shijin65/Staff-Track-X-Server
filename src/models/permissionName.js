const Permissions = (sequelize, DataTypes) => {
  const Permission = sequelize.define("permissions", {
    permissionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "permission_id",
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
  });

  Permission.associate = (models) => {
    Permission.hasMany(models.role_permissions, {
      foreignKey: "permission_id",
      as: "rolePermissions",
    });
  };

  return Permission;
};

module.exports = Permissions;