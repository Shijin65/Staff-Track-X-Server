import { SUPER_ADMIN_UID } from "../../constants/valueConstant";
import { asyncHandler } from "../../middleware";
import { sequelize } from "../../models";
import resetPasswordEmail from "../../templates/email_templates/resetPasswordMail";
import welcomeEmail from "../../templates/email_templates/welcomeMail";
import { ApiResponse, getPermissionsByRoleId, getUserRole } from "../../utils";

const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const db = require("../../models");

const PERMISSIONS = require("../../constants/Permissions").default;
const {
  PASSWORD_SETUP_LINK_EXPIRY,
  PASSWORD_SETUP_SECRET_KEY,
} = require("../../config/envConfig");

const User = db.users;
const Uniform = db.user_uniforms;
class UserController {
  // GET ALL USER              ////////////////////////////////////////

  static getAll = asyncHandler(async (req, res) => {


    const {
      SortBy = "updatedAt",
      SortByAscending = "false",
      Page = 1,
      Limit = 10,
      SearchQuery = "",
      IsActive,
    } = req.query;

    const page = parseInt(Page as string);
    const limit = parseInt(Limit as string);
    const offset = (page - 1) * limit;
    const sortDirection = SortByAscending === "true" ? "ASC" : "DESC";


    // Base WHERE
    const whereClause: any = {
      userId: { [Op.ne]: SUPER_ADMIN_UID },
    };

    // Search
    if (SearchQuery) {
      const search = `%${(SearchQuery as string).toLowerCase()}%`;
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: search } },
        { lastName: { [Op.iLike]: search } },
        { email: { [Op.iLike]: search } },
      ];
    }

    // Active filter
    if (IsActive === "true" || IsActive === "false") {
      whereClause.isActive = IsActive === "true";
    }

    // Sorting
    let order: any = [[SortBy, sortDirection]];
    if (SortBy === "fullName") {
      order = [
        ["firstName", sortDirection],
        ["lastName", sortDirection],
      ];
    }

    // Query
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order,
    });

    // Format response
    const data = rows.map((user) => ({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      verification: user.verification,
      updatedAt: user.updatedAt,
    }));

    return res.json(
      new ApiResponse(200, "Success", data, {
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        itemCount: data.length,
      })
    );
  });

  // GET USER BY ID   ////////////////////////////////////////
  static getById = asyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({
        where: { userId: id },
        include: [{ model: Uniform, as: "uniform" }],
      });

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found."));
      }
      const userRoleDetails = getUserRole(user.roleId);
      const role = userRoleDetails
        ? { roleId: userRoleDetails.roleId, title: userRoleDetails.name }
        : null;

      const allPermissions = Object.values(PERMISSIONS);
      const userPermissions = getPermissionsByRoleId(
        user.roleId,
        user.isSuperAdmin
      );

      const updatedApis = allPermissions.map((permission) => ({
        name: permission,
        is_access: userPermissions.includes(permission),
      }));

      const response = {
        email: user.email,
        userId: id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
        rating: user.rating,
        profileUpdated: user.profileUpdated,
        experience: user.experience,
        verification: user.verification,
        emergencyContact: user.emergencyContact,
        role,
        permissions: updatedApis,
        address: user.address,
        state: user.state,
        district: user.district,
        city: user.city,
        bloodGroup: user.bloodGroup,
        dateOfBirth: user.dateOfBirth,
        uniform: user.uniform
      };
      return res.json(new ApiResponse(200, "Success.", response));
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to get User."));
    }
  });

  //// GET USER PERMISSION BY ID            ////////////////////////////////////////
  static getPermissionById = asyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({
        where: { userId: id },
        include: [{ model: Uniform, as: "uniform" }],
      });

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found."));
      }

      const userRoleDetails = getUserRole(user.roleId);
      const roles = userRoleDetails
        ? [{ roleId: userRoleDetails.roleId, title: userRoleDetails.name }]
        : [];

      const allPermissions = Object.values(PERMISSIONS);
      const userPermissions = getPermissionsByRoleId(
        user.roleId,
        user.isSuperAdmin
      );

      const updatedApis = allPermissions.map((permission) => ({
        name: permission,
        is_access: userPermissions.includes(permission),
      }));

      const response = {
        userId: id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        email: user.email,
        gender: user.gender,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
        roles,
        permissions: updatedApis,
        address: user.address,
        state: user.state,
        district: user.district,
        city: user.city,
        bloodGroup: user.bloodGroup,
        dateOfBirth: user.dateOfBirth,
        uniform: user.uniform
      };
      return res.json(new ApiResponse(200, "Success.", response));
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to get User."));
    }
  });

  // CREATE USER               ////////////////////////////////////////

  static create = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const {
        role,
        firstName,
        lastName,
        mobileNumber,
        email,
        isActive,
        gender,
        rating,
        profileUpdated,
        experience,
        verification,
        emergencyContact,
        address,
        state,
        district,
        city,
        bloodGroup,
        dateOfBirth,
        whiteShirt,
        blackPant,
        executiveBlackShoe,
        grooming,
      } = req.body;

      const newUserDetails = await User.create(
        {
          roleId: role,
          firstName,
          lastName,
          mobileNumber,
          email,
          isActive,
          gender,
          rating,
          profileUpdated,
          experience,
          verification,
          emergencyContact,
          address: address || null,
          state: state || null,
          district: district || null,
          city: city || null,
          bloodGroup: bloodGroup || null,
          dateOfBirth: dateOfBirth || null,
        },
        { transaction: t }
      );

      const newUser = newUserDetails.get({ plain: true });

      if (newUser) {
        await Uniform.create(
          {
            userId: newUser.userId,
            whiteShirt: whiteShirt || false,
            blackPant: blackPant || false,
            executiveBlackShoe: executiveBlackShoe || false,
            grooming: grooming || false,
          },
          { transaction: t }
        );
      }

      if (newUser.isActive) {
        const jwtToken = await jwt.sign(
          { userId: newUser.userId, linkType: "join" },
          PASSWORD_SETUP_SECRET_KEY,
          {
            expiresIn: PASSWORD_SETUP_LINK_EXPIRY,
          }
        );
        console.log("new user :", newUser, "jwtToken :", jwtToken, "PASSWORD_SETUP_SECRET_KEY :", PASSWORD_SETUP_SECRET_KEY, "PASSWORD_SETUP_LINK_EXPIRY :", PASSWORD_SETUP_LINK_EXPIRY)
        await welcomeEmail(newUser, jwtToken);
        newUserDetails.isMailSend = true;
        await newUserDetails.save({ transaction: t });
      }

      await t.commit();

      return res
        .status(201)
        .json(new ApiResponse(201, "User created successfully.", req.body));

    } catch (error) {
      await t.rollback();

      console.error("Error creating user:", error);

      return res
        .status(400)
        .json(new ApiResponse(400, error.message || "Failed to create User."));
    }
  });

  // UPDATE USER                ////////////////////////////////////////
  static updateUser = asyncHandler(async (req, res) => {
    try {
      const id = req.params.id;
      const {
        firstName,
        lastName,
        mobileNumber,
        isActive,
        gender,
        rating,
        profileUpdated,
        experience,
        verification,
        emergencyContact,
        address,
        state,
        district,
        city,
        bloodGroup,
        dateOfBirth,
        whiteShirt,
        blackPant,
        executiveBlackShoe,
        grooming,
        role
      } = req.body;
      const user = await User.findByPk(id);
      if (user) {
        if (user.roleId !== role || user.isActive !== isActive) {
          user.tokenInvalidDateTime = new Date();
        }
        user.roleId = role;
        user.firstName = firstName;
        user.lastName = lastName;
        user.mobileNumber = mobileNumber;
        user.isActive = isActive;
        user.gender = gender;
        user.rating = rating;
        user.experience = experience;
        user.verification = verification;
        user.emergencyContact = emergencyContact;
        user.address = address || null;
        user.state = state || null;
        user.district = district || null;
        user.city = city || null;
        user.bloodGroup = bloodGroup || null;
        user.dateOfBirth = dateOfBirth || null;
        if (profileUpdated !== undefined) {
          user.profileUpdated = profileUpdated;
        }

        const updatedUser = await user.save();

        let uniformRecord = await Uniform.findOne({ where: { userId: id } });
        if (uniformRecord) {
          uniformRecord.whiteShirt = whiteShirt || false;
          uniformRecord.blackPant = blackPant || false;
          uniformRecord.executiveBlackShoe = executiveBlackShoe || false;
          uniformRecord.grooming = grooming || false;
          await uniformRecord.save();
        } else {
          await Uniform.create({
            userId: id,
            whiteShirt: whiteShirt || false,
            blackPant: blackPant || false,
            executiveBlackShoe: executiveBlackShoe || false,
            grooming: grooming || false,
          });
        }

        if (!user?.isMailSend && isActive) {
          const jwtToken = await jwt.sign(
            { userId: updatedUser.userId, linkType: "join" },
            PASSWORD_SETUP_SECRET_KEY,
            {
              expiresIn: PASSWORD_SETUP_LINK_EXPIRY,
            }
          );
          // await welcomeEmail(updatedUser, jwtToken);
          updatedUser.isMailSend = true;
          await updatedUser.save();
        }
        res.json(
          new ApiResponse(
            200,
            "The User has been updated successfully.",
            updatedUser
          )
        );
      } else {
        res.status(400).json(new ApiResponse(400, "User not found."));
      }
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to update User."));
    }
  });

  // DELETE USER                ////////////////////////////////////////
  static deleteUser = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const loginUser = (req as any).user.userId;

      const user = await User.findByPk(id);

      if (user) {
        if (user.userId === loginUser) {
          return res
            .status(400)
            .json(
              new ApiResponse(
                400,
                "You cannot delete your own account. Please contact the administrator."
              )
            );
        }
        await User.destroy({
          where: {
            userId: id,
          },
        });
        return res.json(new ApiResponse(200, "User Removed."));
      } else {
        return res.status(404).json(new ApiResponse(404, "User not found."));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json(new ApiResponse(400, "Failed to delete User."));
    }
  });

  // MULTIPLE DELETE USER       ////////////////////////////////////////
  static deleteMany = asyncHandler(async (req, res) => {
    try {
      const { ids } = req.body;
      const loginUser = (req as any).user.userId;
      const users = await User.findAll({
        where: {
          userId: { [Op.in]: ids },
        },
        raw: true,
      });

      if (!users || users.length === 0) {
        return res.status(404).json(new ApiResponse(404, "User(s) Not Found."));
      }
      if (loginUser && users.some((user) => user.userId === loginUser)) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              "You cannot delete your own account. Please contact the administrator."
            )
          );
      }
      await User.destroy({
        where: {
          userId: { [Op.in]: ids },
        },
      });
      return res.json(new ApiResponse(200, "User(s) Removed."));
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to delete User(s)."));
    }
  });

  //GET USER PROFILE DATA                 ////////////////////////////////////////
  static getProfile = asyncHandler(async (req, res) => {
    try {
      const id = (req as any).user.userId;

      const user = await User.findOne({
        where: { userId: id },
      });

      if (!user) {
        res.status(404).json(new ApiResponse(404, "User not found."));
      }

      const response = {
        userId: id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
      };

      return res.json(new ApiResponse(200, "Success.", response));
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to get User."));
    }
  });

  // UPDATE USER PROFILE                ////////////////////////////////////////
  static updateUserProfile = asyncHandler(async (req, res) => {
    try {
      const id = (req as any).user.userId;
      const { firstName, lastName, mobileNumber, gender } = req.body;

      const user = await User.findByPk(id);
      if (user) {
        user.firstName = firstName;
        user.lastName = lastName;
        user.mobileNumber = mobileNumber;
        user.gender = gender;
        user.tokenInvalidDateTime = new Date();

        const updatedUser = await user.save();

        res.json(
          new ApiResponse(
            200,
            "The User has been updated successfully.",
            updatedUser
          )
        );
      } else {
        res.status(400).json(new ApiResponse(400, "User not found."));
      }
    } catch (error) {
      console.log(error);
      res.status(400).json(new ApiResponse(400, "Failed to update User."));
    }
  });

  // SET NEW PASSWORD           ////////////////////////////////////////
  static setNewPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    try {
      const decoded = jwt.verify(id, PASSWORD_SETUP_SECRET_KEY);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user && user.password && (await user.verifyPassword(password))) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              "New password cannot be the same as the old password."
            )
          );
      }
      user.password = password;
      user.isEmailLinkUsed = true;
      user.temporaryPassword = null;
      await user.save();
      return res
        .status(200)
        .json(new ApiResponse(200, "Password updated successfully."));
    } catch (error) {
      console.log(error);
      if (error.name === "TokenExpiredError") {
        return res
          .status(410)
          .json(
            new ApiResponse(
              410,
              "This link has expired. Please contact the administrator to resend it."
            )
          );
      } else {
        return res.status(400).json(new ApiResponse(400, "Failed to set password."))
      }
    }
  });

  // RESET PASSWORD TRIGGER // RESET PASSWORD MAIL SENDER ////////////////////////////////////////
  static resetPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User Not Found."));
      }

      user.temporaryPassword = password;
      await user.save();

      const jwtToken = await jwt.sign(
        { userId: user.userId, linkType: "passwordReset" },
        PASSWORD_SETUP_SECRET_KEY,
        {
          expiresIn: PASSWORD_SETUP_LINK_EXPIRY,
        }
      );

      // Send reset password email
      await resetPasswordEmail(user.dataValues, password, jwtToken);

      res.json(new ApiResponse(200, "Password Reset Successful."));
    } catch (error) {
      console.error("Error during password reset:", error);
      res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "An error occurred while processing your password reset request."
          )
        );
    }
  });

  // FORGET PASSWORD TRIGGER // FORGET PASSWORD MAIL SENDER ////////////////////////////////////////
  static forgetPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User Not Found."));
      }

      user.temporaryPassword = password;
      await user.save();

      const jwtToken = await jwt.sign(
        { userId: user.userId, linkType: "passwordReset" },
        PASSWORD_SETUP_SECRET_KEY,
        {
          expiresIn: PASSWORD_SETUP_LINK_EXPIRY,
        }
      );

      // Send reset password email
      await resetPasswordEmail(user.dataValues, password, jwtToken);

      res.json(new ApiResponse(200, "Password Reset Successful."));
    } catch (error) {
      console.error("Error during password reset:", error);
      res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "An error occurred while processing your forget password request."
          )
        );
    }
  });

  // CHANGE PASSWORD TRIGGER    ////////////////////////////////////////
  static changePassword = asyncHandler(async (req, res) => {
    const id = (req as any).user.userId;
    const { newPassword } = req.body;
    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User Not Found."));
      }

      if (user && (await user.verifyPassword(newPassword))) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              "New password cannot be the same as the old password."
            )
          );
      }
      user.password = newPassword;
      user.temporaryPassword = null;
      await user.save();

      res.json(new ApiResponse(200, "Password Reset Successful."));
    } catch (error) {
      console.error("Error during password reset:", error);
      res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "An error occurred while processing your change password request."
          )
        );
    }
  });

  // CHECK TEMPORARY PASSWORD   ////////////////////////////////////////
  static checkSecretKey = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;

    try {
      const decoded = jwt.verify(id, PASSWORD_SETUP_SECRET_KEY);
      const user = await User.findOne({ where: { email }, raw: true });

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found."));
      }

      if (decoded.userId !== user.userId) {
        return res
          .status(400)
          .json(new ApiResponse(400, "Invalid credentials."));
      }

      if (user.temporaryPassword === password) {
        res.status(202).json(
          new ApiResponse(202, "Temporary password matched successfully.", {
            redirect: true,
          })
        );
      } else {
        res.status(400).json(new ApiResponse(400, "Invalid credentials."));
      }
    } catch (error) {
      res.status(400).json(new ApiResponse(400, "Failed to compare password."));
    }
  });

  // CHECK EMAIL                ////////////////////////////////////////
  static checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      res.json(new ApiResponse(200, "Email Already Exists."));
    } else {
      res.status(204).json(new ApiResponse(204, "Email Not Exists."));
    }
  });

  // CHECK CURRENT PASSWORD                ////////////////////////////////////////
  static checkCurrentPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const id = (req as any).user.userId;

    const user = await User.findByPk(id);

    if (user && (await user.verifyPassword(password))) {
      res.json(new ApiResponse(200, "Password matched."));
    } else {
      res.status(204).json(new ApiResponse(204, "Password not matched."));
    }
  });
}

export default UserController;
