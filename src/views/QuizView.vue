<template>
  <section class="quiz-page">
    <div class="page-toolbar">
      <span class="toolbar-label">题目</span>
      <el-input
        v-model="keyword"
        class="toolbar-input"
        placeholder="题目关键词"
        clearable
        @keyup.enter.native="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">查询题目</el-button>
      <el-button type="success" @click="openAddDialog">添加题目</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="pagedQuizzes"
      class="data-table"
      empty-text="暂无题目数据"
      :header-cell-style="{ background: '#fff', color: '#606266', fontWeight: '600' }"
      :cell-style="{ padding: '14px 0' }"
    >
      <el-table-column prop="id" label="序号" width="80" />
      <el-table-column prop="question" label="问题" min-width="220" show-overflow-tooltip />
      <el-table-column prop="options" label="选项" min-width="280" show-overflow-tooltip />
      <el-table-column prop="answer" label="答案" width="120" />
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
        :total="filteredQuizzes.length"
      />
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="560px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-form ref="quizForm" :model="form" :rules="rules" label-width="70px">
        <el-form-item label="问题" prop="question">
          <el-input
            v-model.trim="form.question"
            type="textarea"
            :rows="2"
            maxlength="255"
            show-word-limit
            placeholder="请输入题目内容"
          />
        </el-form-item>
        <el-form-item label="选项" prop="options">
          <el-input
            v-model.trim="form.options"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
            placeholder="多个选项用英文逗号分隔，例如：A,B,C,D"
          />
        </el-form-item>
        <el-form-item label="答案" prop="answer">
          <el-input v-model.trim="form.answer" maxlength="100" placeholder="请输入正确答案" />
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
import { fetchQuizzes, createQuiz, updateQuiz, deleteQuiz } from '@/api/quiz'

function emptyForm() {
  return { id: null, question: '', options: '', answer: '' }
}

export default {
  name: 'QuizView',
  data() {
    return {
      quizzes: [],
      keyword: '',
      appliedKeyword: '',
      currentPage: 1,
      pageSize: 5,
      loading: false,
      saving: false,
      dialogVisible: false,
      dialogTitle: '添加题目',
      form: emptyForm(),
      rules: {
        question: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
        options: [{ required: true, message: '请输入选项', trigger: 'blur' }],
        answer: [{ required: true, message: '请输入正确答案', trigger: 'blur' }]
      }
    }
  },
  computed: {
    filteredQuizzes() {
      const keyword = this.appliedKeyword.trim().toLowerCase()
      if (!keyword) return this.quizzes
      return this.quizzes.filter(quiz => String(quiz.question || '').toLowerCase().includes(keyword))
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredQuizzes.length / this.pageSize))
    },
    pagedQuizzes() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredQuizzes.slice(start, start + this.pageSize)
    }
  },
  created() {
    this.loadQuizzes()
  },
  methods: {
    async loadQuizzes() {
      this.loading = true
      try {
        const data = await fetchQuizzes()
        this.quizzes = Array.isArray(data) ? data : []
        this.ensurePageInRange()
      } catch (error) {
        this.quizzes = []
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
      this.dialogTitle = '添加题目'
      this.form = emptyForm()
      this.dialogVisible = true
      this.clearValidate()
    },
    openEditDialog(row) {
      this.dialogTitle = '编辑题目'
      this.form = {
        id: row.id,
        question: row.question,
        options: row.options,
        answer: row.answer
      }
      this.dialogVisible = true
      this.clearValidate()
    },
    clearValidate() {
      this.$nextTick(() => {
        if (this.$refs.quizForm) this.$refs.quizForm.clearValidate()
      })
    },
    handleDialogClosed() {
      this.form = emptyForm()
      this.clearValidate()
    },
    submitForm() {
      this.$refs.quizForm.validate(async valid => {
        if (!valid) return

        this.saving = true
        try {
          const payload = {
            question: this.form.question.trim(),
            options: this.form.options.trim(),
            answer: this.form.answer.trim()
          }

          if (this.form.id) {
            await updateQuiz(this.form.id, payload)
            this.$message.success('修改成功')
          } else {
            await createQuiz(payload)
            this.$message.success('添加成功')
          }

          this.dialogVisible = false
          await this.loadQuizzes()
        } catch (error) {
          this.$message.error(error.message)
        } finally {
          this.saving = false
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm(`确定删除题目“${row.question}”吗？此操作不可恢复。`, '删除提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
      } catch (error) {
        return
      }

      try {
        await deleteQuiz(row.id)
        this.$message.success('删除成功')
        await this.loadQuizzes()
      } catch (error) {
        this.$message.error(error.message)
      }
    },
    ensurePageInRange() {
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
      if (this.currentPage < 1) this.currentPage = 1
    }
  }
}
</script>

<style scoped>
.quiz-page {
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
