/**
 * Migration script to convert agent_id from string to ObjectId in KPI registry
 * 
 * This script should be run once to migrate existing data from string agent_id
 * to ObjectId format in the agent_kpi_registry collection.
 * 
 * Usage:
 * 1. Make sure you have a backup of your database
 * 2. Run this script: npx ts-node src/modules/metering/migrations/convert-kpi-registry-agent-id.ts
 */

import { connect, Types } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/electra';

async function migrateKpiRegistryAgentId() {
  let connection;
  
  try {
    connection = await connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const collection = connection.connection.db.collection('agent_kpi_registry');
    
    // Find all documents with string agent_id
    const documents = await collection.find({
      agent_id: { $type: 'string' }
    }).toArray();
    
    console.log(`Found ${documents.length} documents to migrate`);
    
    if (documents.length === 0) {
      console.log('No documents need migration');
      return;
    }
    
    // Process each document
    for (const doc of documents) {
      try {
        // Validate that the string is a valid ObjectId
        if (!Types.ObjectId.isValid(doc.agent_id)) {
          console.warn(`Invalid ObjectId format for agent_id: ${doc.agent_id}, skipping document ${doc._id}`);
          continue;
        }
        
        // Convert string to ObjectId
        const agentObjectId = new Types.ObjectId(doc.agent_id);
        
        // Update the document
        await collection.updateOne(
          { _id: doc._id },
          { 
            $set: { 
              agent_id: agentObjectId 
            } 
          }
        );
        
        console.log(`Migrated document ${doc._id}: ${doc.agent_id} -> ${agentObjectId}`);
        
      } catch (error) {
        console.error(`Error migrating document ${doc._id}:`, error);
      }
    }
    
    console.log('Migration completed successfully');
    
    // Verify the migration
    const remainingStringIds = await collection.countDocuments({
      agent_id: { $type: 'string' }
    });
    
    if (remainingStringIds === 0) {
      console.log('✅ All agent_id fields have been successfully converted to ObjectId');
    } else {
      console.warn(`⚠️  ${remainingStringIds} documents still have string agent_id`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateKpiRegistryAgentId()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateKpiRegistryAgentId };
