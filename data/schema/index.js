/**
 * KCI-OS Graph Schema — Index
 * 
 * Exports node and edge schemas together for easy import.
 */

const { NODE_SCHEMA, getNodeLabels, getNodeSchema, getRequiredProperties, validateNode } = require("./node-schema");
const { EDGE_SCHEMA, getEdgeNames, getEdgeSchema, isValidSource, isValidTarget, validateEdgeCreation, getConfidenceInfo, getEdgesForNode } = require("./edge-schema");

module.exports = {
  // Node schema
  NODE_SCHEMA,
  getNodeLabels,
  getNodeSchema,
  getRequiredProperties,
  validateNode,

  // Edge schema
  EDGE_SCHEMA,
  getEdgeNames,
  getEdgeSchema,
  isValidSource,
  isValidTarget,
  validateEdgeCreation,
  getConfidenceInfo,
  getEdgesForNode,
};
