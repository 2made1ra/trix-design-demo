import { computed, ref } from 'vue'
import { getOrganization, type Organization } from '@/api/demo'
import { getMe, type User } from '@/api/generated'

const user = ref<User | null>(null)
const org = ref<Organization | null>(null)

const isSpeaker = computed(() => user.value?.roles.includes('speaker') ?? false)
const isOrgAdmin = computed(() => !!org.value)
const role = computed<'speaker' | 'org-admin' | null>(() =>
  isOrgAdmin.value && !isSpeaker.value ? 'org-admin' : user.value ? 'speaker' : null,
)
const needsOnboarding = computed(() => isSpeaker.value && !user.value?.onboarding_completed_at)
const needsOrgOnboarding = computed(() => org.value?.step != null)
// Аккаунт только организации стартует в кабинете, остальные — в подборке.
const startPath = computed(() => (role.value === 'org-admin' ? '/org/speakers' : '/events'))

export const useAuth = () => {
  const loadOrg = async () => {
    const res = await getOrganization()
    org.value = res.status === 200 ? res.data : null
  }

  const setToken = async (token: string, u: User) => {
    localStorage.setItem('token', token)
    user.value = u
    org.value = null
    if (u.roles.includes('devrel') || u.roles.includes('admin')) await loadOrg()
  }

  const logout = () => {
    localStorage.removeItem('token')
    user.value = null
    org.value = null
  }

  const fetchMe = async () => {
    if (user.value || !localStorage.getItem('token')) return

    const res = await getMe()
    if (res.status !== 200) return logout()
    user.value = res.data
    if (res.data.roles.includes('devrel') || res.data.roles.includes('admin')) await loadOrg()
  }

  return {
    user,
    org,
    role,
    isSpeaker,
    isOrgAdmin,
    needsOnboarding,
    needsOrgOnboarding,
    startPath,
    setToken,
    logout,
    fetchMe,
    loadOrg,
  }
}
