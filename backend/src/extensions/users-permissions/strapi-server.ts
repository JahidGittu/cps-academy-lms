import type { Context } from 'koa';

type UsersPermissionsPlugin = {
  controllers: {
    user: { me: (ctx: Context) => Promise<void> };
  };
};

export default (plugin: UsersPermissionsPlugin) => {
  const { me } = plugin.controllers.user;

  // The output sanitizer removes every relation the caller is not allowed to read, and reading
  // the role collection is an Admin-only permission, so /users/me answered without a role for
  // the three roles that need it most. The role the request was already authenticated with is
  // put back here rather than by widening that permission.
  plugin.controllers.user.me = async (ctx: Context) => {
    await me(ctx);

    // ctx.body is typed as unknown, so the shape being added to is stated here.
    const user = ctx.body as { role?: unknown } | null;
    const role = ctx.state.user?.role;

    if (user && role) {
      user.role = { id: role.id, name: role.name, type: role.type };
    }
  };

  return plugin;
};
