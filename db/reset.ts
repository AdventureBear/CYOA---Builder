import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });

async function reset() {
  console.log('Resetting database...');

  try {
    // Drop Drizzle's migration table first
    await client`DROP TABLE IF EXISTS "__drizzle_migrations";`;
    console.log('Dropped __drizzle_migrations table.');
    
    // Drop join tables first to avoid foreign key errors
    await client`DROP TABLE IF EXISTS "scene_choices";`;
    console.log('Dropped scene_choices table.');
    await client`DROP TABLE IF EXISTS "outcome_choices";`;
    console.log('Dropped outcome_choices table.');
    await client`DROP TABLE IF EXISTS "action_outcomes";`;
    console.log('Dropped action_outcomes table.');
    await client`DROP TABLE IF EXISTS "scene_actions";`;
    console.log('Dropped scene_actions table.');
    
    // Drop the core entity tables
    await client`DROP TABLE IF EXISTS "choices";`;
    console.log('Dropped choices table.');
    await client`DROP TABLE IF EXISTS "outcomes";`;
    console.log('Dropped outcomes table.');
    await client`DROP TABLE IF EXISTS "actions";`;
    console.log('Dropped actions table.');
    await client`DROP TABLE IF EXISTS "scenes";`;
    console.log('Dropped scenes table.');
    

    //Helper tables
    await client`DROP TABLE IF EXISTS "flags";`;
    console.log('Dropped flags table.');
    await client`DROP TABLE IF EXISTS "items";`;
    console.log('Dropped items table.');
    

    // Drop ENUM types created by previous migrations
    await client`DROP TYPE IF EXISTS "action_status";`;
    await client`DROP TYPE IF EXISTS "scene_status";`;
    await client`DROP TYPE IF EXISTS "action_trigger";`;

    console.log('Database reset complete.');
  } catch (err) {
    console.error('Error resetting database:', err);
  } finally {
    await client.end();
  }
}

reset().catch((err) => {
  console.error('Error in reset script:', err);
  process.exit(1);
}); 