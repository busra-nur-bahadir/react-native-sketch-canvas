import React from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import SketchCanvas from './src/SketchCanvas';
import {Tools} from './src/tools';
// import { requestPermissions } from './src/handlePermissions';

export default class RNSketchCanvas extends React.Component {

  static defaultProps = {
    touchEnabled: true,
    currentTool: Tools.SKETCH,
    setTool: () => { },
    containerStyle: null,
    menuStyle: null,
    canvasStyle: null,
    onStrokeStart: () => { },
    onStrokeChanged: () => { },
    onStrokeEnd: () => { },
    onClosePressed: () => { },
    onUndoPressed: () => { },
    onClearPressed: () => { },
    onErasePressed: () => { },
    onSketchPressed: () => { },
    onPathsChange: () => { },
    user: null,
    closeComponent: null,
    eraseComponent: null,
    sketchComponent: null,
    undoComponent: null,
    clearComponent: null,
    saveComponent: null,
    strokeComponent: null,
    strokeSelectedComponent: null,
    strokeWidthComponent: null,
    strokeColorsComponent: null,
    strokeColors: [
      { color: '#000000' },
      { color: '#FF0000' },
      { color: '#00FFFF' },
      { color: '#0000FF' },
      { color: '#0000A0' },
      { color: '#ADD8E6' },
      { color: '#800080' },
      { color: '#FFFF00' },
      { color: '#00FF00' },
      { color: '#FF00FF' },
      { color: '#FFFFFF' },
      { color: '#C0C0C0' },
      { color: '#808080' },
      { color: '#FFA500' },
      { color: '#A52A2A' },
      { color: '#800000' },
      { color: '#008000' },
      { color: '#808000' },
    ],
    alphaValues: ['33', '77', 'AA', 'FF'],
    defaultStrokeIndex: 0,
    defaultStrokeWidth: 3,
    minStrokeWidth: 3,
    maxStrokeWidth: 15,
    strokeWidthStep: 3,
    savePreference: null,
    onSketchSaved: () => { },
    text: null,
    localSourceImage: null,
    permissionDialogTitle: '',
    permissionDialogMessage: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      color: props.strokeColors[props.defaultStrokeIndex].color,
      strokeWidth: props.defaultStrokeWidth,
      alpha: 'FF',
      prevTool: undefined
    };
    this._colorChanged = false;
    this._strokeWidthStep = props.strokeWidthStep;
    this._alphaStep = 1;
  }

  clear() {
    this._sketchCanvas.clear();
  }

  undo() {
    return this._sketchCanvas.undo();
  }

  addPath(data) {
    this._sketchCanvas.addPath(data);
  }

  deletePath(id) {
    this._sketchCanvas.deletePath(id);
  }

  save() {
    const { savePreference } = this.props;
    if (savePreference) {
      const p = savePreference();
      this._sketchCanvas.save(
        p.imageType,
        p.transparent,
        p.folder || '',
        p.filename,
        p.includeImage !== false,
        p.includeText !== false,
        p.cropToImageSize || false
      );
    } else {
      const date = new Date();
      this._sketchCanvas.save(
        'png',
        false,
        '',
        `${date.getFullYear()}-${date.getMonth() + 1}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}-${('0' + date.getMinutes()).slice(-2)}-${('0' + date.getSeconds()).slice(-2)}`,
        true,
        true,
        false
      );
    }
  }

  nextStrokeWidth(value) {
    // if (
    //   (this.state.strokeWidth >= this.props.maxStrokeWidth && this._strokeWidthStep > 0) ||
    //   (this.state.strokeWidth <= this.props.minStrokeWidth && this._strokeWidthStep < 0)
    // ) {
    //   this._strokeWidthStep = -this._strokeWidthStep;
    // }
    this.setState({ strokeWidth: this.props.minStrokeWidth + value });
  }


  onClickColor = (itemColor, btn) => {
    if (this.state.color === itemColor && btn) {
      const index = this.props.alphaValues.indexOf(this.state.alpha);
      this.setState({
        alpha: this.props.alphaValues[(index + (this._alphaStep < 0 ? 1 : -1) + this.props.alphaValues.length) % this.props.alphaValues.length],
      });
    } else {
      this.setState({ color: itemColor, alpha: 'FF' });
      this._colorChanged = true;
    }
  }

  _renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ marginHorizontal: 2.5 }}
      onPress={() => {
        this.onClickColor(item.color, true)
        this.props.onSketchPressed()
      }}
    >
      {this.state.color !== item.color && this.props.strokeComponent && this.props.strokeComponent(item.color)}
      {this.state.color === item.color && this.props.strokeSelectedComponent && this.props.strokeSelectedComponent(item.color + (this.state.color.length === 9 ? '' : this.state.alpha))}
    </TouchableOpacity>
  );

  componentDidUpdate() {
    this._colorChanged = false;
  }

  // async componentDidMount() {
  //   await requestPermissions(this.props.permissionDialogTitle, this.props.permissionDialogMessage);
  // }

  handleStrokeStart = (event) => {
    if (this.props.currentTool !== Tools.ERASER && this.props.currentTool !== Tools.SKETCH) {
      if (this.state.prevTool == Tools.ERASER || this.props.currentTool == Tools.SKETCH)
        this.props.setTool(this.state.prevTool ?? Tools.SKETCH)
      else
        this.props.setTool(Tools.SKETCH)
    }
    this.props.onStrokeStart(event);
  };

  handleToolChange = (newTool) => {
    this.setState({ prevTool: this.props.currentTool }, () => {
      this.props.setTool(newTool);
    });
  };

  render() {
    return (
      <View style={this.props.containerStyle}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <View style={[this.props.menuStyle, { flexDirection: 'column' }]}>
            <View style={[this.props.menuInnerStyle]}>
              {this.props.sketchComponent && (
                <TouchableOpacity onPress={() => {
                  this.handleToolChange(Tools.SKETCH)
                  var tempColor = this.state.color == '#00000000' ? '#000000' : this.state.color
                  this.props.strokeSelectedComponent(tempColor + (this.state.color.length === 9 ? '' : this.state.alpha))
                  this.props.strokeComponent(tempColor)
                  this.onClickColor(tempColor, false)
                  this.props.onSketchPressed()
                }}>
                  {this.props.sketchComponent}
                </TouchableOpacity>
              )}
              {this.props.closeComponent && (
                <TouchableOpacity onPress={this.props.onClosePressed}>
                  {this.props.closeComponent}
                </TouchableOpacity>
              )}
              {this.props.eraseComponent && (
                <TouchableOpacity onPress={() => {
                  this.setState({ color: '#00000000' })
                  this.handleToolChange(Tools.ERASER)
                  this.props.onErasePressed();
                }}>
                  {this.props.eraseComponent}
                </TouchableOpacity>
              )}
              {this.props.undoComponent && (
                <TouchableOpacity onPress={() => {
                  this.handleToolChange(Tools.UNDO)
                  this.props.onUndoPressed(this.undo())
                }}>
                  {this.props.undoComponent}
                </TouchableOpacity>
              )}
              {this.props.clearComponent && (
                <TouchableOpacity onPress={() => {
                  this.handleToolChange(Tools.CLEAR)
                  this.clear();
                  this.props.onClearPressed();
                }}>
                  {this.props.clearComponent}
                </TouchableOpacity>
              )}
              {this.props.saveComponent && (
                <TouchableOpacity onPress={() => this.save()}>
                  {this.props.saveComponent}
                </TouchableOpacity>
              )}
            </View>
            <View style={[this.props.menuInnerStyle]}>
              {(this.props.strokeWidthComponent) && (this.props.currentTool == Tools.ERASER || this.props.currentTool == Tools.SKETCH) && (
                this.props.strokeWidthComponent(this.state.strokeWidth, (value) => this.nextStrokeWidth(value))
              )
              }
              {(this.props.strokeWidthComponent) && (this.props.currentTool == Tools.SKETCH) && (
                <View style={[{ flexDirection: 'row' }]}>
                  <View style={{ justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap', flexDirection: 'row' }}>
                    {this.props.strokeColorsComponent}
                    <View style={{ backgroundColor: this.state.color + (this.state.color.length === 9 ? '' : this.state.alpha), width: 20, height: 20, borderRadius: 4 }} />
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <FlatList
                      numColumns={3}
                      data={this.props.strokeColors}
                      extraData={this.state}
                      keyExtractor={(item, index) => index.toString()} // Stable key
                      renderItem={this._renderItem}
                      showsHorizontalScrollIndicator={false}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
        <SketchCanvas
          ref={(ref) => (this._sketchCanvas = ref)}
          style={this.props.canvasStyle}
          strokeColor={this.state.color + (this.state.color.length === 9 ? '' : this.state.alpha)}
          onStrokeStart={this.handleStrokeStart}
          onStrokeChanged={this.props.onStrokeChanged}
          onStrokeEnd={this.props.onStrokeEnd}
          user={this.props.user}
          strokeWidth={this.state.strokeWidth}
          onSketchSaved={this.props.onSketchSaved}
          onPathsChange={this.props.onPathsChange}
          text={this.props.text}
          localSourceImage={this.props.localSourceImage}
          permissionDialogTitle={this.props.permissionDialogTitle}
          permissionDialogMessage={this.props.permissionDialogMessage}
          touchEnabled={this.props.touchEnabled}
        />
      </View>
    );
  }
}

RNSketchCanvas.MAIN_BUNDLE = SketchCanvas.MAIN_BUNDLE;
RNSketchCanvas.DOCUMENT = SketchCanvas.DOCUMENT;
RNSketchCanvas.LIBRARY = SketchCanvas.LIBRARY;
RNSketchCanvas.CACHES = SketchCanvas.CACHES;

export { SketchCanvas };
