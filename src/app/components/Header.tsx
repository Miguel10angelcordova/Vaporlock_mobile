import { StyleSheet, Text, View } from 'react-native'

export function Header() {
  return (
    <View style={styles.headerContainer}>
      
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 44, 
  },
  outerPlate: {
    width: '90%',
    maxWidth: 380,
    height: 72,
    backgroundColor: '#341c0c',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#734623',
    padding: 4,
    elevation: 8,
    shadowColor: '#100804',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  innerPlate: {
    flex: 1,
    backgroundColor: '#261307',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e29a4a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 30,
  },
  headerText: {
    color: '#e29a4a',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginHorizontal: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#e29a4a',
    opacity: 0.8,
  },
  screwContainerLeft: {
    position: 'absolute',
    left: 12,
  },
  screwContainerRight: {
    position: 'absolute',
    right: 12,
  },
  screwOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3b200e',
    borderWidth: 1.5,
    borderColor: '#f0b56b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screwInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9e6129',
  },
})