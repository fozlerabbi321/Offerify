import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-image', () => {
    const { View } = require('react-native');
    return {
        Image: (props) => <View {...props} />,
    };
});

// jest.mock('expo-font');
// jest.mock('expo-asset');

jest.mock('expo-modules-core', () => ({
    requireNativeModule: jest.fn(),
    NativeModulesProxy: {},
    EventEmitter: jest.fn(),
}));
