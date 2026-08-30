import type { Core } from '@strapi/strapi';

import applyRolesAndPermissions from './permissions';
import seedDemoAccounts         from './seed';
import seedDemoContent          from './seed-content';


export default {
  register() {},

  // runs once on every boot — syncs the permission matrix to the DB and seeds demo data
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await applyRolesAndPermissions({ strapi });
    await seedDemoAccounts({ strapi });
    await seedDemoContent({ strapi });
  },
};
