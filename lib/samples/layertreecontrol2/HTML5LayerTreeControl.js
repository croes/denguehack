define([
  'contextmenu/ContextMenu',
  'contextmenu/ContextMenuManager',
  './SVGUtil',
  'luciad/model/tileset/RasterTileSetModel',
  'luciad/view/feature/FeatureLayer',
  'luciad/view/grid/GridLayer',
  'luciad/view/image/RasterImageLayer',
  'luciad/view/LayerTreeNode',
  'luciad/view/LayerTreeNodeType',
  'luciad/view/LayerTreeVisitor',
  'luciad/view/PaintRepresentation',
  'luciad/view/tileset/RasterTileSetLayer',
  'require'
], function(ContextMenu, ContextMenuManager, SVGUtil, RasterTileSetModel, FeatureLayer, GridLayer, RasterImageLayer,
            LayerTreeNode, LayerTreeNodeType, LayerTreeVisitor, PaintRepresentation, RasterTileSetLayer, require) {

  var LAYERNODE_DOM_ID_PREFIX = "layerTreeNode_";

  var iconsFolderURL = require.toUrl("layertreecontrol2/icons/");

  function getIconURL(iconFilename) {
    return iconsFolderURL + iconFilename;
  }

  /**
   * DOM structure and CSS classes:
   *    - .layerTreeControl
   *       - .layerTreeHeader
   *          -.layerTreeTitleIcon
   *          - .layerTreeTitle
   *          - .layerTreeButton .layerTreeCollapseAction
   *       - .layerTreeBody
   *          - .layerTreePanel
   *            -.layerTreeNode (.layerTreeLayer | .layerTreeGroup)
   *              - .layerTreeLayerIcon (.layerTreeVectorLayerIcon | .layerTreeGridLayerIcon | .layerTreeRasterLayerIcon | .layerTreeElevationLayerIcon | .layerTreeGridLayerIcon)
   *              - .layerTreeNodeLabel
   *              - .layerTreeVisibleToggle
   *              - .layerTreeButtons
   *                 .layerTreeFitAction
   *                 .layerTreeMoreAction
   *              - .layerTreeGroupChildren? (in case of layerTreeGroup)
   *                - .layerTreeNode (.layerTreeLayer | .layerTreeGroup)
   */

  function HTML5LayerTreeControl(map, options) {
    this._map = map;
    options = options || {};
    var domElement = document.getElementById(options.domId);
    if (!domElement) {
      domElement = document.createElement('div');
      if (options.domId) {
        domElement.id = options.domId;
      } else {
        domElement.style.position = "absolute";
        domElement.style.top = options.top || "10px";
        domElement.style.right = options.right || "10px";
        if (options.width) {
          domElement.style.width = options.width;
        }
        if (options.height) {
          domElement.style.height = options.height;
        }
      }
      map.domNode.appendChild(domElement);
    }
    this._layerTreeControlNode = domElement;
    this._open = true;
    this._contextMenuManager = new ContextMenuManager();
    this._createDOMStructure();
    this._wireEventListeners();
    this._addLayersFromLayerTree();
  }

  HTML5LayerTreeControl.prototype = Object.create(Object.prototype);
  HTML5LayerTreeControl.prototype.constructor = HTML5LayerTreeControl;

  HTML5LayerTreeControl.prototype._createDOMStructure = function() {
    var self = this;
    this._layerTreeControlNode.classList.add("layerTreeControl");

    this._headerNode = document.createElement("div");
    this._headerNode.classList.add("layerTreeHeader");
    this._layerTreeControlNode.appendChild(this._headerNode);

    this._titleIconNode = document.createElement("div");
    this._titleIconNode.classList.add("layerTreeTitleIcon");
    SVGUtil.loadSVGNode(getIconURL("layer.svg")).then(function(svgNode) {
      self._titleIconNode.appendChild(svgNode);
    });
    this._headerNode.appendChild(this._titleIconNode);

    this._titleNode = document.createElement("div");
    this._titleNode.classList.add("layerTreeTitle");
    this._titleNode.innerHTML = "MAP LAYERS";
    this._headerNode.appendChild(this._titleNode);

    this._collapseActionNode = document.createElement("div");
    this._collapseActionNode.classList.add("layerTreeButton");
    this._collapseActionNode.classList.add("layerTreeCollapseAction");
    SVGUtil.loadSVGNode(getIconURL("expand_node.svg")).then(function(svgNode) {
      self._collapseActionNode.appendChild(svgNode);
    });
    this._headerNode.appendChild(this._collapseActionNode);

    this._bodyNode = document.createElement("div");
    this._bodyNode.classList.add("layerTreeBody");
    this._layerTreeControlNode.appendChild(this._bodyNode);

    this._panelNode = document.createElement("div");
    this._panelNode.classList.add("layerTreePanel");
    this._bodyNode.appendChild(this._panelNode);
  };

  HTML5LayerTreeControl.prototype._wireEventListeners = function() {
    var self = this;
    var collapseActionListener = this._collapseActionNode.addEventListener("click", function(event) {
      event.stopPropagation();
      event.preventDefault();
      self.toggle();
      return false;
    });
    var headerClickListener = this._headerNode.addEventListener("click", function(event) {
      event.stopPropagation();
      event.preventDefault();
      self.toggle();
      return false;
    });
    var layerRemoveListener = this._map.layerTree.on("NodeRemoved", function(event) {
      var domNode = self._getDOMElementForLayerNode(event.node);
      domNode.parentNode.removeChild(domNode);
    });
    var layerMoveListener = this._map.layerTree.on("NodeMoved", function(event) {
      var movedLayer = event.node;
      var parentLayer = event.path[event.path.length - 1] || self._map.layerTree;
      self._moveOrAddLayerDomNodeInDOM(movedLayer, parentLayer, event.index);
    });
    var layerAddedListener = this._map.layerTree.on("NodeAdded", function(event) {
      var addedLayer = event.node;
      var parentLayer = event.path[event.path.length - 1] || self._map.layerTree;
      self._moveOrAddLayerDomNodeInDOM(addedLayer, parentLayer, event.index);
    });
    this._selectionHoverEnabled = true;
    var selectionHoverListener = this._panelNode.addEventListener("mousemove", function(event) {
      if (self._selectionHoverEnabled && self._isValidLayerTreeNodeInteractionTarget(event.target)) {
        var layer = self._getLayerForDomElement(event.target);
        self.setSelected(layer);
      }
    });
  };

  HTML5LayerTreeControl.prototype.setSelected = function(layer) {
    if (this._selectedLayer !== layer) {
      var layerDomNodes = this._panelNode.querySelectorAll('.layerTreeNode');
      [].forEach.call(layerDomNodes, function(layerDomNode) {
        layerDomNode.classList.remove("layerTreeSelectedNode");
        layerDomNode.querySelector('.layerTreeNodeButtons').style.display = 'none';
      });
      this._selectedLayer = layer;
      if (!this._selectedLayer) {
        return;
      }
      var selectedDomNode = this._getDOMElementForLayerNode(this._selectedLayer);
      selectedDomNode.classList.add("layerTreeSelectedNode");
      selectedDomNode.querySelector('.layerTreeNodeButtons').style.display = 'block';

      var selectedLayerNode = this._getDOMElementForLayerNode(this._selectedLayer);
      var visibleToggle = selectedLayerNode.querySelector(".layerTreeVisibleToggle");
      visibleToggle.classList.toggle("layerTreeDisabled", !this._selectedLayer.visible);

      var self = this;
      if (this._removeSelectionOnLeaveListener) {
        this._removeSelectionOnLeaveListener.remove();
      }
      this._removeSelectionOnLeaveListener = selectedDomNode.addEventListener("mouseleave", function(event) {
        if (self._selectionHoverEnabled) {
          self.setSelected(null);
        }
      });
    }
  };

  /**
   * Populates the layertreecontrol DOM node based on the map's layerTree contents.
   * @private
   */
  HTML5LayerTreeControl.prototype._addLayersFromLayerTree = function() {
    var layerTreeControl = this;
    var layerTreeVisitor = {
      visitLayer: function(layer) {
        var index = layer.parent ? layer.parent.children.indexOf(layer) : 0;
        layerTreeControl._moveOrAddLayerDomNodeInDOM(layer, layer.parent, index);
        return LayerTreeVisitor.ReturnValue.CONTINUE;
      },
      visitLayerGroup: function(layerGroup) {
        var index = layerGroup.parent ? layerGroup.parent.children.indexOf(layerGroup) : 0;
        layerTreeControl._moveOrAddLayerDomNodeInDOM(layerGroup, layerGroup.parent, index);
        return LayerTreeVisitor.ReturnValue.CONTINUE;
      }
    };
    this._map.layerTree.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
  };

  /**
   * Creates a .layerTreeNode DIV for a given layer.
   * Does not insert it into the DOM.
   * @param layer The layer to create a DOM node for
   * @returns {Element} The DOM node representing the layer in the layerTree control
   * @private
   */
  HTML5LayerTreeControl.prototype._createLayerDiv = function(layer) {
    var self = this;
    //1. main layerTreeNode div
    var layerDiv = document.createElement("div");
    layerDiv.id = this._getDOMIdForLayerNode(layer);
    layerDiv.classList.add("layerTreeNode");
    var layerClass = (layer.treeNodeType === LayerTreeNodeType.LAYER) ? "layerTreeLayer" : "layerTreeGroup";
    layerDiv.classList.add(layerClass);

    //2. layer type icon
    var layerIcon = document.createElement("div");
    layerIcon.classList.add("layerTreeLayerIcon");
    var layerIconInfo = this._getLayerIconInfo(layer);
    layerIcon.classList.add(layerIconInfo.iconClass);
    SVGUtil.loadSVGNode(getIconURL(layerIconInfo.svg)).then(function(svgNode) {
      layerIcon.appendChild(svgNode);
    });
    layerIcon.title = layerIconInfo.title;
    layerDiv.appendChild(layerIcon);

    //3. layer label
    var layerLabelText = document.createElement("span");
    layerLabelText.innerHTML = layer.label;
    layerLabelText.title = layer.label;
    layerLabelText.classList.add("layerTreeNodeLabel");
    layerDiv.appendChild(layerLabelText);

    //4. extra buttons (visibile on selected)
    var layerButtonsDiv = document.createElement("div");
    layerButtonsDiv.classList.add("layerTreeNodeButtons");

    //4.1 contextMenuaction
    var contextMenuAction = document.createElement("span");
    contextMenuAction.classList.add("layerTreeMoreAction");
    contextMenuAction.classList.add("layerTreeButton");
    contextMenuAction.title = "Other actions";
    SVGUtil.loadSVGNode(getIconURL("dots.svg")).then(function(svgNode) {
      contextMenuAction.appendChild(svgNode);
    });

    //4.1.1. context menu
    var contextMenu = this._createLayerContextMenu(layer, layerDiv);

    contextMenuAction.addEventListener("click", function(event) {
      if (!contextMenu.isOpen()) {
        event.stopPropagation();
        // var rect = moreAction.getBoundingClientRect();
        self._contextMenuManager.showOnly(contextMenu, event.clientX, event.clientY, "topRight");
        return false;
      } else {
        contextMenu.hide();
        self.setSelected(layer);
      }
    });
    layerButtonsDiv.appendChild(contextMenuAction);

    //4.2 fit action button
    var fitAction = document.createElement("div");
    fitAction.classList.add("layerTreeFitLayerAction");
    fitAction.classList.add("layerTreeButton");
    fitAction.title = "Fit to layer";
    SVGUtil.loadSVGNode(getIconURL("fit.svg")).then(function(svgNode) {
      fitAction.appendChild(svgNode);
    });
    layerButtonsDiv.appendChild(fitAction);
    var fitActionListener = fitAction.addEventListener("click", function(event) {
      if (layer.treeNodeType !== LayerTreeNodeType.LAYER_GROUP) {
        self._map.mapNavigator.fit(layer.bounds);
      }
    });
    layerDiv.appendChild(layerButtonsDiv);

    //hide layer button actions (show them when selected)
    layerButtonsDiv.style.display = 'none';

    //5. visibility toggle
    var visibleToggle = document.createElement("div");
    SVGUtil.loadSVGNode(getIconURL("visible.svg")).then(function(visibleSVGIcon) {
      visibleToggle.appendChild(visibleSVGIcon);
    });
    visibleToggle.classList.add("layerTreeVisibleToggle");
    visibleToggle.classList.add("layerTreeButton");
    visibleToggle.classList.toggle("layerTreeDisabled", !layer.visible);
    visibleToggle.title = "Toggle layer visibility";
    layerDiv.appendChild(visibleToggle);
    layerDiv.classList.toggle("layerTreeTextDisabled", !layer.visible);
    visibleToggle.addEventListener("click", function(event) {
      layer.visible = !layer.visible;
      event.stopPropagation();
      return false;
    });
    layer.on("VisibilityChanged", function(value) {
      visibleToggle.classList.toggle("layerTreeDisabled", !value);
      layerDiv.classList.toggle("layerTreeTextDisabled", !value);
    });

    //6. layer children
    var layerChildrenDiv;
    if (layer.children.length > 0) {
      layerChildrenDiv = document.createElement("div");
      layerChildrenDiv.classList.add("layerTreeGroupChildren");
      layerDiv.appendChild(layerChildrenDiv);
    }
    for (var i = layer.children.length - 1; i >= 0; i--) { //children's orginal order is bottom -> top, we want to append from top -> bottom
      var child = layer.children[i];
      var childDiv = this._createLayerDiv(child);
      layerChildrenDiv.appendChild(childDiv);
    }

    //7. wire DOM event listeners
    this._wireDragAndDropListeners(layerDiv);
    layerDiv.addEventListener("dblclick", function(event) {
      if (self._isValidLayerTreeNodeInteractionTarget(event.target)
          && !event.target.classList.contains("layerTreeVisibleToggle")
          && self._getLayerForDomElement(event.target) === layer
          && self._selectedLayer == layer
          && layer.treeNodeType !== LayerTreeNodeType.LAYER_GROUP) {
        self._map.mapNavigator.fit({
          bounds: layer.bounds,
          animate: true
        });
      }
    });
    return layerDiv;
  };

  HTML5LayerTreeControl.prototype._createLayerContextMenu = function(layer, layerDiv) {
    var self = this;
    var contextMenu = new ContextMenu();
    var deleteItem = document.createElement("div");
    var deleteItemIcon = document.createElement("span");
    deleteItemIcon.classList.add("layerTreeRemoveLayerAction");
    deleteItemIcon.classList.add("layerTreeContextMenuIcon");
    SVGUtil.loadSVGNode(getIconURL("delete.svg")).then(function(svgNode) {
      deleteItemIcon.appendChild(svgNode);
    });
    deleteItem.appendChild(deleteItemIcon);
    var deleteItemLabel = document.createElement("span");
    deleteItemLabel.innerHTML = "Delete";
    var removeActionListener = deleteItem.addEventListener("click", function(event) {
      layer.parent.removeChild(layer);
      self._contextMenuManager.hideAll();
    });
    deleteItem.appendChild(deleteItemLabel);
    contextMenu.addItem(deleteItem);

    if (layer.isPaintRepresentationSupported(PaintRepresentation.LABEL)) {
      //labeled toggle
      var labeledToggle = document.createElement("div");
      var labeledToggleIcon = document.createElement("span");
      labeledToggleIcon.classList.add("layerTreeLabeledToggle");
      labeledToggleIcon.classList.add("layerTreeContextMenuIcon");
      var layerLabeled = layer.isPaintRepresentationVisible(PaintRepresentation.LABEL);
      labeledToggleIcon.classList.toggle("layerTreeDisabled", !layerLabeled);
      SVGUtil.loadSVGNode(getIconURL("label.svg")).then(function(svgNode) {
        labeledToggleIcon.appendChild(svgNode);
      });
      labeledToggle.appendChild(labeledToggleIcon);
      var labeledToggleLabel = document.createElement("span");
      labeledToggleLabel.classList.toggle("layerTreeTextDisabled", !layerLabeled);
      labeledToggleLabel.innerHTML = "Labeled";
      labeledToggle.appendChild(labeledToggleLabel);
      var labeledToggleListener = labeledToggle.addEventListener("click", function(event) {
        if (layer.isPaintRepresentationSupported(PaintRepresentation.LABEL)) {
          var layerLabeled = layer.isPaintRepresentationVisible(PaintRepresentation.LABEL);
          layer.setPaintRepresentationVisible(PaintRepresentation.LABEL, !layerLabeled);
        }
      });
      layer.on("PaintRepresentationVisibilityChanged", function(value, paintRepresentation) {
        if (paintRepresentation === PaintRepresentation.LABEL) {
          labeledToggleIcon.classList.toggle("layerTreeDisabled", !value);
          labeledToggleLabel.classList.toggle("layerTreeTextDisabled", !value);
        }
      });
      contextMenu.addItem(labeledToggle);
    }

    //selectable toggle
    if (layer instanceof FeatureLayer) {
      //editable toggle
      var editableToggle = document.createElement("div");
      var editableToggleIcon = document.createElement("div");
      editableToggleIcon.classList.add("layerTreeEditableToggle");
      editableToggleIcon.classList.add("layerTreeContextMenuIcon");
      editableToggleIcon.classList.toggle("layerTreeDisabled", !layer.editable);
      SVGUtil.loadSVGNode(getIconURL("edit.svg")).then(function(svgIcon) {
        editableToggleIcon.appendChild(svgIcon);
      });
      editableToggle.appendChild(editableToggleIcon);
      var editableToggleLabel = document.createElement("span");
      editableToggleLabel.innerHTML = "Editable";
      editableToggleLabel.classList.toggle("layerTreeTextDisabled", !layer.editable);
      editableToggle.appendChild(editableToggleLabel);
      var labeledToggleListener = editableToggle.addEventListener("click", function(event) {
        layer.editable = !layer.editable;
      });
      layer.on("EditableChanged", function(value) {
        editableToggleIcon.classList.toggle("layerTreeDisabled", !value);
        editableToggleLabel.classList.toggle("layerTreeTextDisabled", !value);
      });
      contextMenu.addItem(editableToggle);

      var selectableToggle = document.createElement("div");
      var selectableToggleIcon = document.createElement("div");
      selectableToggleIcon.classList.add("layerTreeSelectableToggle");
      selectableToggleIcon.classList.add("layerTreeContextMenuIcon");
      selectableToggleIcon.classList.toggle("layerTreeDisabled", !layer.selectable);
      SVGUtil.loadSVGNode(getIconURL("selectable.svg")).then(function(svgNode) {
        selectableToggleIcon.appendChild(svgNode);
      });
      selectableToggle.appendChild(selectableToggleIcon);
      layer.on("SelectableChanged", function(value) {
        selectableToggleIcon.classList.toggle("layerTreeDisabled", !value);
        selectableToggleLabel.classList.toggle("layerTreeTextDisabled", !value);
      });

      var selectableToggleLabel = document.createElement("span");
      selectableToggleLabel.innerHTML = "Selectable";
      selectableToggleLabel.classList.toggle("layerTreeTextDisabled", !layer.selectable);
      selectableToggle.appendChild(selectableToggleLabel);
      selectableToggle.addEventListener("click", function(event) {
        layer.selectable = !layer.selectable;
      });
      contextMenu.addItem(selectableToggle);
    }
    self._contextMenuManager.registerContextMenu(contextMenu);
    //keep stuff selected while contextmenu is open
    contextMenu.on("ContextMenuOpened", function() {
      self._selectionHoverEnabled = false;
    });
    contextMenu.on("ContextMenuClosed", function() {
      self._selectionHoverEnabled = true;
      self.setSelected(null);
    });
    return contextMenu;
  };

  HTML5LayerTreeControl.prototype._getLayerIconInfo = function(layer) {
    if (layer instanceof FeatureLayer) {
      return {
        iconClass: "layerTreeVectorLayerIcon",
        title: "Vector layer",
        svg: "shapes.svg"
      };
    } else if (layer instanceof RasterImageLayer || layer instanceof RasterTileSetLayer) {
      //TODO: NOT API!
      var iconClass = layer.model.modelDescriptor.type === RasterTileSetModel.TYPE_ELEVATION
          ? "layerTreeElevationLayerIcon" : "layerTreeRasterLayerIcon";
      var title = layer.model.modelDescriptor.type === RasterTileSetModel.TYPE_ELEVATION ? "Elevation layer"
          : "Raster imagery layer";
      var svg = layer.model.modelDescriptor.type === RasterTileSetModel.TYPE_ELEVATION ? "terrain_profile.svg"
          : "raster_layer.svg";
      return {
        iconClass: iconClass,
        title: title,
        svg: svg
      }
    } else if (layer instanceof GridLayer) {
      return {
        iconClass: "layerTreeGridLayerIcon",
        title: "Grid layer",
        svg: "grid.svg"
      };
    } else if (layer.treeNodeType === LayerTreeNodeType.LAYER_GROUP) {
      return {
        iconClass: "layerTreeGroupIcon",
        title: "Layer group",
        svg: "open.svg"
      };
    }
    return {
      iconClass: "layerTreeUnkownLayerTypeIcon",  //not defined yet in CSS
      title: "Unknown layer type",
      svg: "unknown.svg"
    }
  };

  HTML5LayerTreeControl.prototype._moveOrAddLayerDomNodeInDOM = function(layer, parentLayer, index) {
    var layerDiv = this._getDOMElementForLayerNode(layer) || this._createLayerDiv(layer);
    var parentLayerNode = (parentLayer !== this._map.layerTree) ? this._getDOMElementForLayerNode(
        parentLayer).querySelector(".layerTreeGroupChildren") : this._panelNode;
    var layerTreeNodeList = parentLayerNode.children;
    var layerTreeNodesArr = Array.prototype.slice.call(layerTreeNodeList);
    var indexOfNodeToMoveOrAdd = layerTreeNodesArr.indexOf(layerDiv);
    if (indexOfNodeToMoveOrAdd >= 0) {
      //should move, remove it first
      layerTreeNodesArr.splice(indexOfNodeToMoveOrAdd, 1);
    } //else, just add
    if (index !== 0) {
      var domNodeToMoveInFrontOf = layerTreeNodesArr[layerTreeNodesArr.length - index];
      parentLayerNode.insertBefore(layerDiv, domNodeToMoveInFrontOf);
    } else {
      parentLayerNode.appendChild(layerDiv);
    }
  };

  HTML5LayerTreeControl.prototype._getDOMIdForLayerNode = function(layerTreeNode) {
    return LAYERNODE_DOM_ID_PREFIX + layerTreeNode.id;
  };

  HTML5LayerTreeControl.prototype._getDOMElementForLayerNode = function(layerTreeNode) {
    var id = this._getDOMIdForLayerNode(layerTreeNode);
    return document.getElementById(id);
  };

  HTML5LayerTreeControl.prototype._getLayerDOMNodeForDomElement = function(domElement) {
    var currElem = domElement;
    //panelNode check to avoid going too far up the DOM
    //we know that if it hits the panelNode, we're already too far up the DOM to find layerTreeNodes
    while (currElem && currElem !== this._panelNode && !currElem.classList.contains("layerTreeNode")) {
      currElem = currElem.parentNode;
    }
    if (currElem && currElem !== this._panelNode && currElem.classList.contains("layerTreeNode")) {
      return currElem;

    }
    return null;
  };

  HTML5LayerTreeControl.prototype._getLayerForDomElement = function(domElement) {
    var layerDOMelem = this._getLayerDOMNodeForDomElement(domElement);
    if (layerDOMelem) {
      var layerId = layerDOMelem.id.substring(LAYERNODE_DOM_ID_PREFIX.length, layerDOMelem.id.length);
      return this._map.layerTree.findLayerTreeNodeById(layerId);
    }
    return null;
  };

  HTML5LayerTreeControl.prototype._isValidLayerTreeNodeInteractionTarget = function(domNode) {
    return domNode && domNode.classList
           && (domNode.classList.contains("layerTreeNode") ||
               domNode.classList.contains("layerTreeNodeLabel") ||
               domNode.classList.contains("layerTreeLayerIcon") ||
               domNode.classList.contains("layerTreeVisibleToggle"));
  };

  //handle the start of a drag. e.target is the element being dragged.
  HTML5LayerTreeControl.prototype._handleDragStart = function(e) {
    if (this._isValidLayerTreeNodeInteractionTarget(e.target)) {
      e.target.classList.add("dragging");
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text', e.target.id);
    }
  };

  //handle the end of a drag. e.target is the element being dragged.
  HTML5LayerTreeControl.prototype._handleDragEnd = function(e) {
    var layerDomNodes = this._panelNode.querySelectorAll('.layerTreeNode');
    [].forEach.call(layerDomNodes, function(layerDomNode) {
      layerDomNode.classList.remove("dragging", "dragHover", "dragHoverBottom", "dragHoverTop");
    });
  };

  //handle when a drag gesture goes over an element. e.target is the element being dragged over (not the element being dragged).
  HTML5LayerTreeControl.prototype._handleDragEnter = function(e) {
    if (this._isValidLayerTreeNodeInteractionTarget(e.target)) {
      e.target.classList.add("dragHover");
    }
  };

  //handle when a drag gesture leaves an element. e.target is element that the drag is leaving.
  HTML5LayerTreeControl.prototype._handleDragLeave = function(e) {
    if (this._isValidLayerTreeNodeInteractionTarget(e.target)) {
      e.target.classList.remove("dragHover", "dragHoverBottom", "dragHoverTop");
    }
  };

  HTML5LayerTreeControl.prototype._handleDragOver = function(e) {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }
    e.dataTransfer.dropEffect = 'move'; //change to none for default cursor
    if (this._isValidLayerTreeNodeInteractionTarget(e.target)) {
      //check if top or bottom half of div
      var layerTreeNode = this._getLayerDOMNodeForDomElement(e.target);
      var boundingRect = layerTreeNode.getBoundingClientRect();
      var middleOfDiv = boundingRect.top + (boundingRect.height / 2);
      if (e.clientY < middleOfDiv) {
        layerTreeNode.classList.remove("dragHoverBottom");
        layerTreeNode.classList.add("dragHoverTop");
        this._insertPosition = "above";
      } else {
        layerTreeNode.classList.remove("dragHoverTop");
        layerTreeNode.classList.add("dragHoverBottom");
        this._insertPosition = "below";
      }
    }

    return false;
  };

  HTML5LayerTreeControl.prototype._handleDrop = function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    if (e.stopPropagation) {
      e.stopPropagation(); // stops the browser from redirecting.
    }

    var draggedElementId = e.dataTransfer.getData('text');
    var draggedElement = document.getElementById(draggedElementId);
    if (draggedElement) {
      draggedElement.classList.remove("dragging");
      if (this._isValidLayerTreeNodeInteractionTarget(e.target) && draggedElement !== e.target) {
        var layerToMove = this._getLayerForDomElement(draggedElement);
        var referenceLayer = this._getLayerForDomElement(e.target);
        if (layerToMove.parent === referenceLayer.parent) { //can only move childs with same parent
          if (this._map.layerTree.canMoveChild(layerToMove, this._insertPosition, referenceLayer)) {
            this._map.layerTree.moveChild(layerToMove, this._insertPosition, referenceLayer);
          } //else we cannot move
        } else { //remove layerToMove from it's parent and add it to referenceLayer's parent
          layerToMove.parent.removeChild(layerToMove);
          referenceLayer.parent.addChild(layerToMove, this._insertPosition, referenceLayer);
        }
      }
    }

    return false;
  };

  HTML5LayerTreeControl.prototype._wireDragAndDropListeners = function(layerDomNode) {
    var self = this;
    layerDomNode.addEventListener('dragstart', HTML5LayerTreeControl.prototype._handleDragStart.bind(self), false);
    layerDomNode.addEventListener('dragend', HTML5LayerTreeControl.prototype._handleDragEnd.bind(self), false);
    layerDomNode.addEventListener('dragover', HTML5LayerTreeControl.prototype._handleDragOver.bind(self), false);
    layerDomNode.addEventListener('dragenter', HTML5LayerTreeControl.prototype._handleDragEnter.bind(self), false);
    layerDomNode.addEventListener('dragleave', HTML5LayerTreeControl.prototype._handleDragLeave.bind(self), false);
    layerDomNode.addEventListener('drop', HTML5LayerTreeControl.prototype._handleDrop.bind(self), false);
  };

  HTML5LayerTreeControl.prototype.toggle = function() {
    this._open = !this._open;
    this._updateCollapseState();
  };

  HTML5LayerTreeControl.prototype.close = function() {
    this._open = false;
    this._updateCollapseState();
  };

  HTML5LayerTreeControl.prototype.open = function() {
    this._open = true;
    this._updateCollapseState();
  };

  HTML5LayerTreeControl.prototype._updateCollapseState = function() {
    var self = this;
    self._layerTreeControlNode.classList.remove("layerTreeControlClosed");
    self._collapseActionNode.classList.toggle("layerTreeCollapseActionOpen", self._open);
    self._collapseActionNode.classList.toggle("layerTreeCollapseActionClosed", !self._open);
    self._bodyNode.classList.toggle("layerTreeBodyClosed", !self._open);
    self._panelNode.style.overflow = "hidden"; //hide overflow during anim, to avoid scrollbars
    //Chrome + Safari can mess up width when toggling (it's too small) -> force width recalculation
    var layerTreeNodes = this._panelNode.querySelectorAll(".layerTreeNode");
    for (var i = 0; i < layerTreeNodes.length; i++) {
      var layerTreeNode = layerTreeNodes[i];
      var prevDisplay = layerTreeNode.style.display;
      layerTreeNode.style.display = 'none';
      layerTreeNode.offsetWidth; // no need to store this anywhere, the reference is enough to force layout
      layerTreeNode.style.display = prevDisplay;
    }
    var afterAnim = function() {
      self._panelNode.style.overflow = "auto";
      self._timeoutHandle = null;
      self._layerTreeControlNode.classList.toggle("layerTreeControlClosed", !self._open);
    };
    if (this._timeoutHandle) { //cancel the timeout if we already had one
      clearTimeout(this._timeoutHandle);
    }
    this._timeoutHandle = setTimeout(afterAnim, 300); //sync with anim duration in HTML5LayerTreeControl.css .layerTreeBody
  };

  return HTML5LayerTreeControl;
});