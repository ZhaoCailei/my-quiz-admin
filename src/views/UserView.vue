<template>
  <section class="user-page">
    <div class="page-toolbar">
      <span class="toolbar-label">用户名</span>
      <el-input
        v-model="keyword"
        class="toolbar-input"
        placeholder="用户名"
        clearable
        @keyup.enter.native="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">查询用户</el-button>
      <el-button type="success" @click="openAddDialog">添加用户</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="pagedUsers"
      class="data-table"
      empty-text="暂无用户数据"
      :header-cell-style="{ background: '#fff', color: '#606266', fontWeight: '600' }"
      :cell-style="{ padding: '14px 0' }"
    >
      <el-table-column label="日期" width="190">
        <template slot-scope="scope">
          <span class="date-cell">
            <i class="el-icon-time"></i>{{ formatDate(scope.row.created_at) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" min-width="180">
        <template slot-scope="scope">
          <el-tag size="small" class="username-tag">{{ scope.row.username }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="password" label="密码" min-width="160" />
      <el-table-column label="操作" width="190">
        <template slot-scope="scope">
          <el-button size="mini" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="filteredUsers.length"
      />
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="480px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form ref="userForm" :model="form" :rules="rules" label-width="76px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="form.username" maxlength="50" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model.trim="form.password" maxlength="100" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="日期" prop="created_at">
          <el-date-picker
            v-model="form.created_at"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { fetchUsers, createUser, updateUser, deleteUser } from '@/api/user'

function emptyForm() {
  return { id: null, username: '', password: '', created_at: '' }
}

export default {
  name: 'UserView',
  data() {
    return {
      users: [],
      keyword: '',
      appliedKeyword: '',
      currentPage: 1,
      pageSize: 5,
      loading: false,
      saving: false,
      dialogVisible: false,
      dialogTitle: '添加用户',
      form: emptyForm(),
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        created_at: [{ required: true, message: '请选择日期', trigger: 'change' }]
      }
    }
  },
  computed: {
    filteredUsers() {
      const keyword = this.appliedKeyword.trim().toLowerCase()
      if (!keyword) return this.users
      return this.users.filter(user => String(user.username || '').toLowerCase().includes(keyword))
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize))
    },
    pagedUsers() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredUsers.slice(start, start + this.pageSize)
    }
  },
  created() {
    this.loadUsers()
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        const data = await fetchUsers()
        this.users = Array.isArray(data) ? data : []
        this.ensurePageInRange()
      } catch (error) {
        this.users = []
        this.$message.error(error.message)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.appliedKeyword = this.keyword
      this.currentPage = 1
    },
    openAddDialog() {
      this.dialogTitle = '添加用户'
      this.form = { ...emptyForm(), created_at: this.today() }
      this.dialogVisible = true
      this.clearValidate()
    },
    openEditDialog(row) {
      this.dialogTitle = '编辑用户'
      this.form = {
        id: row.id,
        username: row.username,
        password: row.password,
        created_at: this.normalizeDate(row.created_at)
      }
      this.dialogVisible = true
      this.clearValidate()
    },
    clearValidate() {
      this.$nextTick(() => {
        if (this.$refs.userForm) this.$refs.userForm.clearValidate()
      })
    },
    handleDialogClosed() {
      this.form = emptyForm()
      this.clearValidate()
    },
    submitForm() {
      this.$refs.userForm.validate(async valid => {
        if (!valid) return

        this.saving = true
        try {
          const payload = {
            username: this.form.username.trim(),
            password: this.form.password,
            created_at: this.form.created_at
          }

          if (this.form.id) {
            await updateUser(this.form.id, payload)
            this.$message.success('修改成功')
          } else {
            await createUser(payload)
            this.$message.success('添加成功')
          }

          this.dialogVisible = false
          await this.loadUsers()
        } catch (error) {
          this.$message.error(error.message)
        } finally {
          this.saving = false
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm(`确定删除用户“${row.username}”吗？此操作不可恢复。`, '删除提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
      } catch (error) {
        return
      }

      try {
        await deleteUser(row.id)
        this.$message.success('删除成功')
        await this.loadUsers()
      } catch (error) {
        this.$message.error(error.message)
      }
    },
    ensurePageInRange() {
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
      if (this.currentPage < 1) this.currentPage = 1
    },
    normalizeDate(value) {
      if (!value) return ''
      return String(value).slice(0, 10)
    },
    formatDate(value) {
      return this.normalizeDate(value) || '-'
    },
    today() {
      const now = new Date()
      const pad = number => String(number).padStart(2, '0')
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    }
  }
}
</script>

<style scoped>
.user-page {
  width: 100%;
}

.page-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.toolbar-label {
  margin-right: 12px;
  font-size: 15px;
  color: #606266;
}

.toolbar-input {
  width: 220px;
  margin-right: 16px;
}

.data-table {
  width: 100%;
}

.data-table::before {
  display: none;
}

.data-table ::v-deep th.el-table__cell {
  border-bottom: 1px solid #ebeef5;
}

.data-table ::v-deep td.el-table__cell {
  border-bottom: 1px solid #f0f0f0;
  color: #303133;
}

.date-cell {
  font-size: 14px;
  color: #303133;
}

.date-cell i {
  margin-right: 7px;
  color: #909399;
}

.username-tag {
  border-color: #d9ecff;
  background: #ecf5ff;
  color: #409eff;
  font-size: 13px;
}

.pagination-wrap {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .toolbar-input {
    width: 100%;
    margin: 0 0 12px;
  }
}
</style>
