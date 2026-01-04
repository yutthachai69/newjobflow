'use client'

interface DeleteButtonProps {
  userId: string
  username: string
}

export default function DeleteButton({ userId, username }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${username}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}/delete`, {
        method: 'POST',
      })

      if (response.ok) {
        window.location.href = '/users?success=deleted'
      } else {
        const data = await response.json()
        const error = data.error || 'unknown'
        window.location.href = `/users?error=${error}`
      }
    } catch (error) {
      window.location.href = '/users?error=server_error'
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
    >
      ลบ
    </button>
  )
}

