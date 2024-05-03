module.exports = {
    moduleNameMapper: {
        '@deriv-com/(.*)': '<rootDir>/node_modules/@deriv-com/$1',
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
        '\\.svg': '<rootDir>/__mocks__/svgMock.js',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
        '^.+\\.tsx?$': 'ts-jest',
    },
    transformIgnorePatterns: ['/node_modules/(?!(@deriv-com/ui|@sendbird/chat)).+\\.js$'],
};
