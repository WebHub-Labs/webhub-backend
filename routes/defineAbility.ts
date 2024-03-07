export const defineAdminAbilities = (can, cannot) => {
  can("manage", "all");
  can("edit within 5 hrs", "Post");

  can("assign", "Editor");
  can("edit", "Post");
  can("view", "Post");
};
export const defineEditorAbilities = (can, cannot) => {
  can("edit", "Post");
  can("view", "Post");
  cannot("assign", "Editor");
};
export const defineViewerAbilities = (can, cannot) => {
  cannot("edit", "Post");
  cannot("assign", "Editor");
  can("view", "Post");
};
