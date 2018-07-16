import React, { Component } from 'react';
import MonacoReactComponent from "./MonacoReactComponent";
import defineTheme from './define-theme';
import { Container,CodeContainer } from "./elements";
class MonacoEditor extends Component {
  state = {}
  
  getEditorOptions = () => {
    const currentModule = this.currentModule;
    const fontFamilies = (...families) =>
    families
      .filter(Boolean)
      .map(
        family => (family.indexOf(' ') !== -1 ? JSON.stringify(family) : family)
      )
      .join(', ');
    return {
      selectOnLineNumbers: true,
      fontFamily: fontFamilies(
        'Menlo',
        'Source Code Pro',
        'monospace'
      ),
      minimap: {
        enabled: false,
      },
      formatOnPaste: true,
      folding: true,
      glyphMargin: false,
      fixedOverflowWidgets: true,
      readOnly: !!this.props.readOnly,
    };
  };
  render() {
    const options = this.getEditorOptions();
    
    return (

      <Container>
        <CodeContainer >
          {this.state.fuzzySearchEnabled && (
            <FuzzySearch
              closeFuzzySearch={this.closeFuzzySearch}
              setCurrentModule={this.setCurrentModule}
              modules={sandbox.modules}
              directories={sandbox.directories}
              currentModuleId={currentModule.id}
            />
          )}
          <MonacoReactComponent
            width="100%"
            height="100%"
            theme="CodeSandbox"
            options={options}
            editorDidMount={this.configureEditor}
            editorWillMount={defineTheme}
            openReference={this.openReference}
          />
        </CodeContainer>
      </Container>
    );
  }
}

export default MonacoEditor;