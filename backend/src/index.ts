import type { Core } from '@strapi/strapi';

import applyRolesAndPermissions from './permissions';
import seedDemoAccounts from './seed';
import seedDemoContent from './seed-content';

export default {
  register() {},

  // Roles and their permissions are database rows, so unlike the content types they do not
  // travel with the code. Applying them on every boot means the deployed instance ends up
  // with the same matrix as this one without anyone clicking through the panel twice.
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await applyRolesAndPermissions({ strapi });
    await seedDemoAccounts({ strapi });
    await seedDemoContent({ strapi });
  },
};
