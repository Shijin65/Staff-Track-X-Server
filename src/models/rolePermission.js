const RolePermissions = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define("role_permissions", {
    rolePermissionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "role_permission_id",
    },

    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "role_id",
    },

    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "permission_id",
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

  RolePermission.associate = (models) => {
    RolePermission.belongsTo(models.user_roles, {
      foreignKey: "role_id",
      as: "role",
    });

    RolePermission.belongsTo(models.permissions, {
      foreignKey: "permission_id",
      as: "permission",
    });
  };

  return RolePermission;
};

module.exports = RolePermissions;