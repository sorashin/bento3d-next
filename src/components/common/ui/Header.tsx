import Icon from "@/components/common/ui/Icon"
import { useNavigationStore } from "@/stores/navigation"

const NavButton: React.FC<{
  label: string
  icon: string
  isActive: boolean
  onClick: () => void
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      className={`w-fit p-2 flex justify-center items-center gap-2 rounded-sm ${
        isActive
          ? "bg-[rgba(255,255,255,.56)] shadow-sm"
          : "transparent shadow-none hover:bg-[rgba(255,255,255,.16)]"
      } text-content-h text-xs  transition-all`}
      onClick={() => {
        onClick()
      }}>
      <Icon name={icon} className="w-6 h-6" />
      {label}
    </button>
  )
}

export const Header = () => {
  const { currentNav, currentNavArray, setCurrentNav } = useNavigationStore()
  return (
    <header className="absolute inset-x-0 top-0 pt-8 px-4 flex flex-col justify-between z-20">
      <div className="flex justify-between md:justify-center items-center gap-2 w-full font-display">
        {currentNavArray.map((item, index) => (
          <>
            <NavButton
              key={item.label}
              label={item.label}
              icon={item.icon}
              isActive={currentNav === index}
              onClick={() => {
                setCurrentNav(index)
              }}
            />
            {index < currentNavArray.length - 1 && (
              <Icon
                name="chevron-right"
                className="w-4 h-4 text-content-m-a"></Icon>
            )}
          </>
        ))}
      </div>
    </header>
  )
}
