import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {Provider, SDRView} from './sdr';
import axios from 'axios';

const ClientConfig = {
  sdrTypes: {
    Text: Text,
    View: View,
    Image: Image,
    Button: TouchableOpacity,
  },
};

// 测试
const testData = {
  username: '你好',
  onPress: a => this.oo(a),
  icon:
    'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=350',
  buttonStyle: {
    marginTop: 10,
    width: 200,
    height: 50,
    backgroundColor: '#0f0',
  },
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sdrTemplate: null,
    };
  }

  componentDidMount() {
    this.fetchApiData();
  }

  fetchApiData = () => {
    axios({
      method: 'GET',
      url: 'http://localhost:3000/sdr/template',
    }).then(res => {
      this.setState({sdrTemplate: res.data});
    });
  };

  oo(a) {
    alert(a);
  }

  render() {
    const {sdrTemplate} = this.state;
    return (
      <>
        {!!sdrTemplate && (
          <Provider config={ClientConfig}>
            <SDRView
              sdrTemplate={sdrTemplate}
              test={testData}
              item={{
                info: {
                  buttonName: 'btn',
                },
              }}
            />
          </Provider>
        )}
      </>
    );
  }
}
