import * as allMessages from './messages.constants';

/**
 * Takes resource name as an argument and returns all the messages converted to
 * a resource
 * Note resource should always be {resource_name}(s)
 * @param resourceName resource name to be converted
 * @returns
 */
const getMessages = (resourceName: string) =>
  Object.fromEntries(Object.entries(allMessages).map(([key, val]) => [key, val.replace('@resource_name', resourceName)])); //eslint-disable-line

export default getMessages;
