import AuditLog from '../models/AuditLog.js';
export async function audit({actor,entityType,entityId,action,before=null,after=null,note=''}) {
  await AuditLog.create({actor,entityType,entityId,action,before,after,note});
}
