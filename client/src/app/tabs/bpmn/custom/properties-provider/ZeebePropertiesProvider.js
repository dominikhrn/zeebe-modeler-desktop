/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';

import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';

import executableProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ExecutableProps';

import inputOutput from './parts/InputOutputProps';

import inputOutputParameter from './parts/InputOutputParameterProps';

import mappingProps from './parts/MappingProps';

import headers from './parts/HeadersProps';

import taskDefinition from './parts/TaskDefinitionProps';

import sequenceFlowProps from './parts/SequenceFlowProps';

import messageProps from './parts/MessageProps';

import timerProps from './parts/TimerEventProps';

import payloadMappingsProps from './parts/PayloadMappingsProps';

import multiInstanceProps from './parts/MultiInstanceProps';

import errorProps from './parts/ErrorProps';


const getInputOutputParameterLabel = param => {

  if (is(param, 'zeebe:InputParameter')) {
    return 'Input Parameter';
  }

  if (is(param, 'zeebe:OutputParameter')) {
    return 'Output Parameter';
  }

  return '';
};

const getMappingLabel = param => {

  if (is(param, 'zeebe:Mapping')) {
    return 'Mapping';
  }

  return '';
};


function createGeneralTabGroups(element, bpmnFactory, canvas, translate) {
  const generalGroup = {
    id: 'general',
    label: 'General',
    entries: []
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  executableProps(generalGroup, element, translate);
  taskDefinition(generalGroup, element, bpmnFactory);
  sequenceFlowProps(generalGroup, element, bpmnFactory, translate);
  messageProps(generalGroup, element, bpmnFactory, translate);
  timerProps(generalGroup, element, bpmnFactory, translate);
  errorProps(generalGroup, element, bpmnFactory, translate);

  const multiInstanceGroup = {
    id: 'multiInstance',
    label: translate('Multi Instance'),
    entries: []
  };
  multiInstanceProps(multiInstanceGroup, element, bpmnFactory, translate);

  return [
    generalGroup,
    multiInstanceGroup
  ];
}

function createHeadersGroups(element, bpmnFactory) {

  const headersGroup = {
    id: 'headers-properties',
    label: 'Headers',
    entries: []
  };
  headers(headersGroup, element, bpmnFactory);

  return [
    headersGroup
  ];
}


function createPayloadMappingsTabGroups(element, bpmnFactory) {

  const payloadMappingsGroup = {
    id: 'payload-mappings',
    label: 'Payload Mappings',
    entries: []
  };

  const options = payloadMappingsProps(payloadMappingsGroup, element, bpmnFactory);

  const mappingGroup = {
    id: 'mapping',
    entries: [],
    enabled: function(element, node) {
      return options.getSelectedMapping(element, node);
    },
    label: function(element, node) {
      const param = options.getSelectedMapping(element, node);
      return getMappingLabel(param);
    }
  };

  mappingProps(mappingGroup, element, bpmnFactory, options);

  return [
    payloadMappingsGroup,
    mappingGroup
  ];

}

function createInputOutputTabGroups(element, bpmnFactory) {

  const inputOutputGroup = {
    id: 'input-output',
    label: 'Parameters',
    entries: []
  };

  const options = inputOutput(inputOutputGroup, element, bpmnFactory);

  const inputOutputParameterGroup = {
    id: 'input-output-parameter',
    entries: [],
    enabled: function(element, node) {
      return options.getSelectedParameter(element, node);
    },
    label: function(element, node) {
      const param = options.getSelectedParameter(element, node);
      return getInputOutputParameterLabel(param);
    }
  };

  inputOutputParameter(inputOutputParameterGroup, element, bpmnFactory, options);

  return [
    inputOutputGroup,
    inputOutputParameterGroup
  ];
}

export default class ZeebePropertiesProvider extends PropertiesActivator {
  constructor(eventBus, bpmnFactory, canvas, translate) {

    super(eventBus);

    this._bpmnFactory = bpmnFactory;
    this._canvas = canvas;
    this._translate = translate;

  }

  getTabs(element) {
    const generalTab = {
      id: 'general',
      label: 'General',
      groups: createGeneralTabGroups(
        element, this._bpmnFactory, this._canvas, this._translate)
    };

    const inputOutputTab = {
      id: 'input-output',
      label: 'Input/Output',
      groups: createInputOutputTabGroups(
        element, this._bpmnFactory)
    };

    const payloadMappingsTab = {
      id: 'payload-mappings',
      label: 'Payload Mappings',
      groups: createPayloadMappingsTabGroups(
        element, this._bpmnFactory)
    };

    const headersTab = {
      id: 'headers',
      label: 'Headers',
      groups: createHeadersGroups(
        element, this._bpmnFactory)
    };

    return [
      generalTab,
      inputOutputTab,
      payloadMappingsTab,
      headersTab
    ];
  }

}

ZeebePropertiesProvider.$inject = [
  'eventBus',
  'bpmnFactory',
  'canvas',
  'translate'
];
