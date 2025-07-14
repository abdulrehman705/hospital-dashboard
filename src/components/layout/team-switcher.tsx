import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: any
    plan: string
  }
}) {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          {typeof teams.logo === 'string' ? (
            <img src={teams.logo} alt='logo' width={48} height={48} />
          ) : (
            <teams.logo className='size-4' />
          )}
          <div className='flex-1 text-left text-md leading-tight flex items-center w0'>
            <span className='truncate font-semibold'>
              {teams.name}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
