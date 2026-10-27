import { model } from '@medusajs/framework/utils';
export default model.define('placebo_record',{id:model.id().primaryKey(),kind:model.text(),key:model.text().unique(),payload:model.json()});
