
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUserFromRequest } from '@/lib/custom-auth'
import { hashPassword } from '@/lib/password'
import { canManageUsers, canCreateUsers } from '@/lib/rbac'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request)

        if (!user || !canManageUsers(user.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Access restricted to Admins only.' },
                { status: 403 }
            )
        }

        const users = await db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                jabatan: true,
                department: true,
                createdAt: true
            },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({ success: true, data: users })
    } catch (error) {
        console.error('Failed to fetch users:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUserFromRequest(request)

        if (!user || !canCreateUsers(user.role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { email, name, role, jabatan, password } = body

        if (!email || !password || !name || !role) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email already registered' },
                { status: 400 }
            )
        }

        const hashedPassword = await hashPassword(password)

        const newUser = await db.user.create({
            data: {
                email,
                name,
                role,
                jabatan,
                password: hashedPassword,
                passwordSet: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                jabatan: true
            }
        })

        return NextResponse.json({ success: true, data: newUser })
    } catch (error) {
        console.error('Failed to create user:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create user' },
            { status: 500 }
        )
    }
}
