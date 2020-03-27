import React from 'react';
import {View} from 'react-native';

// 1. 定义类型前缀, props, 方法, text
export const PROP_PREFIX = 'prop::';
export const FUNCTION_PREFIX = 'function::';
export const TEXT_PREFIX = 'text::';

// 2. 数据上下文环境
const ApiContext = React.createContext({
  sdrTypes: {},
  loading: false,
  error: false,
  renderError: () => {},
  renderLoading: () => {},
});

// 3. 数据提供者
export class Provider extends React.Component {
  render() {
    const {config} = this.props;
    return (
      <ApiContext.Provider value={config}>
        {this.props.children}
      </ApiContext.Provider>
    );
  }
}

// 4. 数据消费者
export class SDRView extends React.Component {
  render() {
    return (
      <ApiContext.Consumer>
        {config => <SDRComponent {...this.props} config={config} />}
      </ApiContext.Consumer>
    );
  }
}

// 5. 服务驱动渲染组件, 主要负责请求服务器拿到template, 渲染 SDRContainer 组件
class SDRComponent extends React.Component {
  render() {
    const {config, sdrTemplate} = this.props;
    if (config.loading) {
      return config.renderLoading();
    }
    if (config.error) {
      return config.renderError();
    }
    return (
      <SDRContainer
        {...this.props}
        sdrTypes={config.sdrTypes}
        sdrTemplate={sdrTemplate}
      />
    );
  }
}

// 6. 解析 template, 构建组件
export default class SDRContainer extends React.Component {
  shouldComponentUpdate = this.props.shouldComponentUpdate;

  // 构建
  buildItem() {
    const {sdrTemplate} = this.props;
    if (!sdrTemplate) {
      return <View />;
    }
    // 根据template构建组件
    return this.buildChildren(sdrTemplate);
  }

  /**
   * 根据template构建组件
   * @param {*} node template模版对象
   * @returns
   * @memberof SDRContainer
   */
  buildChildren(node) {
    const {sdrTypes} = this.props;
    // 解析 props
    const props = this.parseNodeProps(node.props) || {};
    // 给组件添加key属性
    props.key = props.key || '' + Math.random();
    if (!Array.isArray(node.children) || node.children.length === 0) {
      return React.createElement(
        sdrTypes[node.type],
        props,
        this.replaceText(node.children),
      );
    }
    // 有子组件, 遍历children, 递归构建
    const children = [];
    for (let i = 0; i < node.children.length; i++) {
      children.push(this.buildChildren(node.children[i]));
    }
    // 创建 children 数组中所有的组件
    return React.createElement(sdrTypes[node.type], props, children);
  }

  // 解析props
  parseNodeProps(propsToParse) {
    if (!propsToParse) {
      return null;
    }
    let props = {...propsToParse};
    for (const key in props) {
      let prop = props[key];
      if (typeof prop === 'string') {
        if (prop.startsWith(PROP_PREFIX)) {
          props[key] = this.replaceProp(prop);
        } else if (prop.startsWith(FUNCTION_PREFIX)) {
          props[key] = this.replaceFunction(prop);
        } else {
          props[key] = this.replaceText(prop);
        }
      } else if (typeof prop === 'object') {
        props[key] = this.parseNodeProps(prop);
      }
    }
    return props;
  }

  // 替换prop
  replaceProp(prop) {
    if (typeof prop !== 'string') {
      return prop;
    }
    const parts = prop.replace(PROP_PREFIX, '').split('.');
    let element = this.props;
    for (let j = 0; j < parts.length && element; j++) {
      element = element[parts[j]];
    }
    return element;
  }

  // 替换fuction
  replaceFunction(prop) {
    if (typeof prop !== 'string') {
      return prop;
    }

    // "function::test.onPress(${text::item.info.buttonName})",
    const segments = prop.replace(FUNCTION_PREFIX, '').split('(');
    if (segments.length === 0) {
      return prop;
    }
    const parts = segments[0].split('.');
    // parts= ['test', 'onPress']
    const argsSegment = segments[1];
    // argsSegment = '${text::item.info.buttonName})'
    let func = this.props;
    // 找到onPress对应的值: func
    for (let i = 0; i < parts.length && func; i++) {
      func = func[parts[i]];
    }
    // func不是函数类型, 返回默认空函数实现
    if (typeof func !== 'function') {
      return () => {};
    }
    // 没有参数,直接返回函数
    if (!argsSegment) {
      return func;
    }

    // 解析function中的参数
    const args = argsSegment.replace(')', '').split(/,\s*/g);
    // args = ["${text::item.info.buttonName}"]
    // 遍历args, 可能存在多个参数
    for (let i = 0; i < args.length; i++) {
      if (args[i].includes(PROP_PREFIX)) {
        args[i] = this.replaceProp(args[i]);
      } else if (args[i].includes(TEXT_PREFIX)) {
        args[i] = this.replaceText(args[i]);
      }
    }
    // 返回真正的函数实现
    return () => func(...args);
  }

  // 替换文本
  replaceText(text) {
    if (typeof text !== 'string') {
      return text;
    }
    const propsRegex = /(\${text::[^}]*})/g;
    const matches = propsRegex.exec(text);
    let replaced = text;
    if (!matches) {
      return text;
    }
    for (let i = 0; i < matches.length; i++) {
      // 取出${}中的有效字段
      const parts = matches[i]
        .replace('${' + TEXT_PREFIX, '')
        .replace('}', '')
        .split('.');
      let element = this.props;
      // 遍历props上的对象, 取到对应的数数据
      for (let j = 0; j < parts.length && element; j++) {
        element = element[parts[j]];
      }
      // 判断当前是否符合替换条件
      const shouldReplace = !!{string: true, number: true, boolean: true}[
        typeof element
      ];
      // 将element替换原来的字符串: ${} -> 123
      replaced = replaced.replace(matches[i], shouldReplace ? element : '');
    }
    return replaced;
  }

  render() {
    return this.buildItem();
  }
}
