import { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Link } from 'expo-router'
import { usePathname } from 'expo-router'
import { 
  Wind, 
  Target, 
  Cloud,
  Menu,
  X,
  Settings,
  type Icon as LucideIcon
} from 'lucide-react-native'

interface StyledIconProps {
  icon: typeof Wind
  size?: number
  color?: string
  style?: any
}

function StyledIcon({ icon: Icon, size = 24, color = '#9CA3AF', style = {} }: StyledIconProps) {
  const iconProps = {
    size,
    stroke: color,
    strokeWidth: 2
  }
  
  return (
    <View style={style}>
      <Icon {...iconProps} />
    </View>
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const routes = [
    { path: '/(tabs)', label: 'Weather', icon: Cloud },
    { path: '/(tabs)/calculator', label: 'Shot Calc', icon: Target },
    { path: '/(tabs)/wind', label: 'Wind Calc', icon: Wind },
    { path: '/(tabs)/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Full Menu Overlay */}
      <TouchableOpacity 
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          },
          !isMenuOpen && { display: 'none' }
        ]}
        onPress={() => setIsMenuOpen(false)}
      />

      {/* Slide-out Menu */}
      <View 
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: 256,
            backgroundColor: '#111827',
            borderRightWidth: 1,
            borderRightColor: '#1F2937',
            padding: 16,
            zIndex: 50,
            transform: [{ translateX: isMenuOpen ? 0 : -256 }]
          }
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#60A5FA' }}>LastShot</Text>
          <TouchableOpacity 
            onPress={() => setIsMenuOpen(false)}
            style={{ padding: 4, borderRadius: 8 }}
          >
            <StyledIcon icon={X} />
          </TouchableOpacity>
        </View>
        
        <View style={{ gap: 4 }}>
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                },
                pathname === route.path 
                  ? { backgroundColor: '#1F2937' }
                  : {}
              ]}
              onPress={() => setIsMenuOpen(false)}
            >
              <StyledIcon 
                icon={route.icon} 
                color={pathname === route.path ? '#60A5FA' : '#9CA3AF'} 
              />
              <Text style={{ color: pathname === route.path ? '#60A5FA' : '#9CA3AF' }}>{route.label}</Text>
            </Link>
          ))}
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111827',
        borderTopWidth: 1,
        borderTopColor: '#1F2937',
        zIndex: 40,
        paddingBottom: 16 // Add padding for safe area
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 }}>
          {/* Menu Button */}
          <TouchableOpacity
            onPress={() => setIsMenuOpen(true)}
            style={{ alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
          >
            <StyledIcon icon={Menu} />
            <Text style={{ fontSize: 12, marginTop: 4, color: '#9CA3AF' }}>Menu</Text>
          </TouchableOpacity>

          {/* Quick Access Links */}
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              style={{ alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
            >
              <StyledIcon icon={route.icon} color={pathname === route.path ? '#60A5FA' : '#9CA3AF'} />
              <Text style={{ fontSize: 12, marginTop: 4, color: pathname === route.path ? '#60A5FA' : '#9CA3AF' }}>
                {route.label}
              </Text>
            </Link>
          ))}
        </View>
      </View>
    </>
  )
}
