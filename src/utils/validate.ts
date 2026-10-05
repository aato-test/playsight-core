import { TestNode, NavigateStepData, AssertStepData } from '../types';

export function validateNode(node: TestNode): string | null {
  if (node.errorMessage) return node.errorMessage;

  if (node.type === 'navigate') {
    const data = node.data as NavigateStepData;
    const url = data.url?.trim() || '';
    if (!url) return 'URL is required';
    const isAbs = /^https?:\/\/\S+$/.test(url);
    const isRel = /^\/\S*/.test(url);
    return isAbs || isRel ? null : 'Enter a valid URL or path (e.g. /checkout or https://...)';
  }

  if (node.type === 'assert') {
    const data = node.data as AssertStepData;
    if (data.assertionType === 'url_contains') {
      return data.expectedValue ? null : 'Expected URL text is required';
    }
    if (data.assertionType === 'expression') {
      return data.expectedValue ? null : 'Expected expression condition is required';
    }
  }

  if (!('selector' in node.data) || !node.data.selector?.trim()) {
    return 'Selector is required';
  }

  if (node.type === 'assert') {
    const data = node.data as AssertStepData;
    if (
      ['text_contains', 'text_equals', 'has_value'].includes(data.assertionType) &&
      !data.expectedValue
    ) {
      return 'Expected value is required';
    }
  }

  return null;
}