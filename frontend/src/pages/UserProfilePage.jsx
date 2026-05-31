import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pencil, X, Eye, EyeOff } from "lucide-react";
import { Sidebar } from "../components/Dashboard/Dashboard";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

function ProfileRow({
  label,
  fieldKey,
  value,
  placeholder,
  editingField,
  onStartEdit,
  onChange,
  textColor,
  mutedColor,
  borderColor,
  inputBg,
  inputType = "text",
}) {
  const isEditing = editingField === fieldKey;

  return (
    <div
      className={`flex items-center justify-between gap-4 border-b py-4 last:border-b-0 ${borderColor}`}
    >
      <span className={`text-sm font-medium ${mutedColor}`}>{label}</span>
      {isEditing ? (
        <input
          type={inputType}
          autoFocus
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className={`w-52 max-w-[55%] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${inputBg} ${borderColor}`}
        />
      ) : (
        <button
          type="button"
          onClick={() => onStartEdit(fieldKey)}
          className={`max-w-[55%] truncate text-right text-sm ${textColor} hover:opacity-80`}
        >
          {value || placeholder}
        </button>
      )}
    </div>
  );
}

const isImageFile = (file) => {
  if (file.type && file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|bmp|heic)$/i.test(file.name || "");
};

const compressImageFile = (file, maxDimension = 400) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process image"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not process image"));
    };

    img.src = objectUrl;
  });

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { isDark: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();
  const { user, updateUser, clearUser } = useUser();
  const avatarInputId = "profile-avatar-upload";

  const [form, setForm] = useState({
    username: "",
    email: "",
    mobile: "",
    location: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [editingField, setEditingField] = useState(null);
  const [editingPassword, setEditingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      username: user.username || user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      location: user.location || "",
      avatar: user.avatar || user.avatarUrl || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setAvatarPreview("");
  }, [user?._id]);

  const displayName = form.username || "User";
  const avatarUrl = avatarPreview || form.avatar;

  const pageBg = isDarkMode ? "bg-[#171717]" : "bg-white";
  const shellBg = isDarkMode ? "bg-white" : "bg-black";
  const shellText = isDarkMode ? "text-black" : "text-white";
  const shellMuted = isDarkMode ? "text-black/60" : "text-white/60";
  const shellDivider = isDarkMode ? "border-black/10" : "border-white/10";

  const detailsBg = isDarkMode ? "bg-[#ececec]" : "bg-[#272727]";
  const detailsText = isDarkMode ? "text-black" : "text-white";
  const detailsMuted = isDarkMode ? "text-black/50" : "text-white/60";
  const detailsBorder = isDarkMode ? "border-black/10" : "border-white/10";
  const detailsInputBg = isDarkMode
    ? "bg-white text-black"
    : "bg-neutral-800 text-white";

  const primaryBtnClass = isDarkMode
    ? "bg-black text-white hover:bg-neutral-800"
    : "bg-white text-black hover:bg-neutral-100";
  const secondaryBtnClass = isDarkMode
    ? "border-black/20 bg-black text-white hover:bg-neutral-800"
    : "border-white/30 bg-white text-black hover:bg-neutral-100";

  const avatarRing = isDarkMode ? "bg-black text-white" : "bg-white text-black";
  const pencilBtnClass = isDarkMode
    ? "border-black/10 bg-white text-black hover:bg-gray-50"
    : "border-white/20 bg-black text-white hover:bg-neutral-800";

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      alert("Please select an image file (JPG, PNG, GIF, or WebP).");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10MB.");
      e.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const dataUrl = await compressImageFile(file);
      setAvatarPreview(dataUrl);
      handleFieldChange("avatar", dataUrl);
    } catch {
      alert("Could not load the image. Please try another JPG or PNG file.");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (editingPassword) {
      if (!form.currentPassword) {
        alert("Enter your current password to reset it.");
        return;
      }
      if (!form.newPassword || form.newPassword.length < 6) {
        alert("New password must be at least 6 characters.");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        alert("New passwords do not match.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        location: form.location.trim(),
        avatar: form.avatar,
      };
      if (editingPassword && form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const updated = await updateUser(payload);
      setAvatarPreview("");
      setEditingField(null);
      setEditingPassword(false);
      setForm((prev) => ({
        ...prev,
        avatar: updated?.avatar || updated?.avatarUrl || prev.avatar,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      alert("Profile saved successfully.");
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Failed to save profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    navigate("/login");
  };

  const mainBg = isDarkMode ? "bg-[#171717]" : "bg-white";
  const loadingText = isDarkMode ? "text-white" : "text-black";

  if (!user) {
    return (
      <div
        className={`flex h-screen w-full items-center justify-center ${mainBg} ${loadingText}`}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full gap-4 p-4 ${mainBg}`}>
      <Sidebar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onCreateNote={() => navigate("/dashboard")}
        currentView="profile"
        onNavigate={(view) => {
          if (view === "dashboard" || view === "pinned" || view === "trash") {
            navigate("/dashboard");
          }
        }}
        onLogout={handleLogout}
      />

      <div
        className={`flex flex-1 items-center justify-center overflow-auto rounded-2xl p-6 ${pageBg}`}
      >
        <div className="w-full max-w-xl overflow-hidden rounded-2xl shadow-sm">
          {/* Header — white in dark mode, black in light mode */}
          <div className={`relative ${shellBg} px-6 pb-5 pt-6`}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className={`absolute right-5 top-5 rounded-lg p-1 transition-colors ${shellMuted} hover:opacity-80`}
              aria-label="Close profile"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold ${avatarRing}`}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  htmlFor={avatarInputId}
                  className={`absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border shadow-sm ${pencilBtnClass} ${
                    isUploadingAvatar ? "pointer-events-none opacity-60" : ""
                  }`}
                  aria-label="Change profile picture"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </label>
              </div>

              <div className="min-w-0 pt-1">
                <h1 className={`truncate text-lg font-bold ${shellText}`}>
                  {displayName}
                </h1>
                <p className={`truncate text-sm ${shellMuted}`}>
                  {form.email || "yourname@gmail.com"}
                </p>
              </div>
            </div>
          </div>

          <div className={`border-t ${shellDivider}`} />

          {/* Details — charcoal + white text (dark), grey + black text (light) */}
          <div className={`px-6 py-2 ${detailsBg}`}>
            <ProfileRow
              label="Name"
              fieldKey="username"
              value={form.username}
              placeholder="your name"
              editingField={editingField}
              onStartEdit={setEditingField}
              onChange={handleFieldChange}
              textColor={detailsText}
              mutedColor={detailsMuted}
              borderColor={detailsBorder}
              inputBg={detailsInputBg}
            />
            <ProfileRow
              label="Email account"
              fieldKey="email"
              value={form.email}
              placeholder="yourname@gmail.com"
              editingField={editingField}
              onStartEdit={setEditingField}
              onChange={handleFieldChange}
              textColor={detailsText}
              mutedColor={detailsMuted}
              borderColor={detailsBorder}
              inputBg={detailsInputBg}
              inputType="email"
            />
            <ProfileRow
              label="Mobile number"
              fieldKey="mobile"
              value={form.mobile}
              placeholder="Add number"
              editingField={editingField}
              onStartEdit={setEditingField}
              onChange={handleFieldChange}
              textColor={detailsText}
              mutedColor={detailsMuted}
              borderColor={detailsBorder}
              inputBg={detailsInputBg}
              inputType="tel"
            />
            <ProfileRow
              label="Location"
              fieldKey="location"
              value={form.location}
              placeholder="Add location"
              editingField={editingField}
              onStartEdit={setEditingField}
              onChange={handleFieldChange}
              textColor={detailsText}
              mutedColor={detailsMuted}
              borderColor={detailsBorder}
              inputBg={detailsInputBg}
            />

            <div
              className={`flex flex-col gap-3 border-b py-4 last:border-b-0 ${detailsBorder}`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className={`text-sm font-medium ${detailsMuted}`}>
                  Reset password
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPassword((prev) => !prev);
                    setEditingField(null);
                  }}
                  className={`text-sm ${detailsText} hover:opacity-80`}
                >
                  {editingPassword ? "Cancel" : "Change password"}
                </button>
              </div>

              {editingPassword && (
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current password"
                      value={form.currentPassword}
                      onChange={(e) =>
                        handleFieldChange("currentPassword", e.target.value)
                      }
                      className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none ${detailsInputBg} ${detailsBorder}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((p) => !p)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${detailsMuted}`}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password"
                      value={form.newPassword}
                      onChange={(e) =>
                        handleFieldChange("newPassword", e.target.value)
                      }
                      className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none ${detailsInputBg} ${detailsBorder}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((p) => !p)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${detailsMuted}`}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      handleFieldChange("confirmPassword", e.target.value)
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${detailsInputBg} ${detailsBorder}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer — white in dark mode, black in light mode */}
          <div
            className={`flex flex-wrap items-center justify-center gap-3 px-6 py-5 ${shellBg}`}
          >
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${primaryBtnClass}`}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleLogout}
              className={`rounded-xl border px-6 py-2.5 text-sm font-semibold transition-colors ${secondaryBtnClass}`}
              whileTap={{ scale: 0.98 }}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </div>

      {/* File input outside overflow-hidden card — fixes Windows picker issues */}
      <input
        id={avatarInputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleAvatarChange}
      />
    </div>
  );
}
