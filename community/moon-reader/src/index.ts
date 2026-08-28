import {
  defineDeviceWorkflow,
  type ExtensionDeviceWorkflowDefinition,
} from '@tomeio/addon-sdk';

import workflowJson from '../device-workflow.json' with { type: 'json' };

export const workflow = defineDeviceWorkflow(
  workflowJson as ExtensionDeviceWorkflowDefinition
);
