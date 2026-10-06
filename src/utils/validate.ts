import { TestNode, NavigateStepData, AssertStepData } from '../types';

const SELECTOR_REQUIRED_TYPES = [
  'click',
  'input',
  'select_dropdown',
  'hover',
  'extract_text',
  'extract_attribute',
  'extract_table',
  'extract_html',
];

export function validateNode(node: TestNode): string | null {
  if (node.errorMessage) return node.errorMessage;

  if (node.type === 'navigate') {
    const data = node.data as NavigateStepData;
    const url = data.url?.trim() || '';
    if (!url) return 'Target URL or route path is required';
    const isAbs = /^https?:\/\/\S+$/.test(url);
    const isRel = /^\/\S*/.test(url);
    return isAbs || isRel ? null : 'Enter a valid URL or path (e.g. /checkout or https://...)';
  }

  if (node.type === 'assert') {
    const data = node.data as AssertStepData;
    if (data.assertionType === 'url_contains') {
      return data.expectedValue?.trim() ? null : 'Expected URL text is required';
    }
    if (data.assertionType === 'expression') {
      return data.expectedValue?.trim() ? null : 'Expected JavaScript expression is required';
    }
    if (!data.selector?.trim()) {
      return 'Target element selector is required for assertion';
    }
    if (
      ['text_contains', 'text_equals', 'has_value'].includes(data.assertionType) &&
      !data.expectedValue?.trim()
    ) {
      return 'Expected value is required for text verification';
    }
    return null;
  }

  if (node.type === 'wait_for') {
    const data = node.data as any;
    if (data.waitType === 'selector' && !data.selector?.trim()) {
      return 'Selector is required when waiting for element';
    }
    return null;
  }

  if (node.type === 'scroll') {
    const data = node.data as any;
    if (data.direction === 'to_selector' && !data.selector?.trim()) {
      return 'Selector is required when scrolling to element';
    }
    return null;
  }

  if (node.type === 'pagination') {
    const data = node.data as any;
    if (!data.nextButtonSelector?.trim()) {
      return 'Next button selector is required for pagination';
    }
    return null;
  }

  if (node.type === 'cookie_banner') {
    return null;
  }

  if (node.type === 'screenshot') {
    return null;
  }

  if (node.type === 'export_json' || node.type === 'export_csv') {
    const data = node.data as any;
    if (!data.datasetVariable?.trim()) {
      return 'Dataset variable name is required for export';
    }
    return null;
  }

  if (node.type === 'webhook_push') {
    const data = node.data as any;
    if (!data.endpointUrl?.trim()) {
      return 'Webhook endpoint URL is required';
    }
    return null;
  }

  if (SELECTOR_REQUIRED_TYPES.includes(node.type)) {
    const selector = (node.data as any)?.selector?.trim();
    if (!selector) {
      return `Target selector is required for ${node.title || node.type}`;
    }
  }

  return null;
}