<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ $t('title') }}
      </v-card-title>

      <v-divider />

      <div v-if="currentWorkspace" class="pa-4">
        <v-expansion-panels flat>

          <v-expansion-panel>
            <v-expansion-panel-header>
              {{$t('main')}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-text-field v-model="workspacePropertySnapshot.name" :label="$t('properties.name')" />
              <v-text-field v-model="workspacePropertySnapshot.description" :label="$t('properties.description')" />
              <v-checkbox v-model="workspacePropertySnapshot.allowCreateNewColumn" :label="$t('properties.allowCreateNewColumn')" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.allowColumnMove" :label="$t('properties.allowColumnMove')" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.allowColumnRemove" :label="$t('properties.allowColumnRemove')" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.allowCreateNewCard" :label="$t('properties.allowCreateNewCard')" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.allowCardRemove" :label="$t('properties.allowCardRemove')" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.allowCardMove" :label="$t('properties.allowCardMove')" class="mt-0" />
              <v-checkbox v-model="workspacePropertySnapshot.workspaceDisabled" :label="$t('properties.workspaceDisabled')" class="mt-0" />
              <v-btn color="error" width="100%" @click="onWorkspaceRemove">{{$t('removeWorkspace')}}</v-btn>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header>
              {{$t('styles')}}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div class="mt-4">
                <v-color-picker v-model="workspacePropertySnapshot.backgroundColor" dot-size="13" mode="hexa" width="450" swatches-max-height="178" :hide-mode-switch="true" class="mt-4" />
              </div>
              <div v-if="workspacePropertySnapshot.backgroundImage" class="mt-4">
                <v-file-input v-if="!workspacePropertySnapshot.backgroundImage.name"
                              :loading="fileLoading"
                              :rules="[validateFileTypes]"
                              :label="$t('properties.backgroundImage')"
                              truncate-length="15"
                              @change="setWorkspaceBackgroundImage"
                />
                <v-btn v-else @click="setWorkspaceBackgroundImage(null)">{{$t('removeImage')}}</v-btn>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <v-divider />

      <v-card-actions>
        <v-spacer></v-spacer>
        <template v-if="settingsHasChanges">
          <v-btn text @click="createWorkspacePropertySnapshot">{{$t('cancel')}}</v-btn>
          <v-btn color="primary" :disabled="!workspacePropertySnapshot.name" @click="saveWorkspaceProperties">{{$t('submit')}}</v-btn>
        </template>
        <v-btn v-else color="gray" text @click="hideDialog">
          {{ $t('closeBtn') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { cloneDeep, isEqual } from 'lodash';
import { workspaceInstance } from '@/store/modules/workspace/config';
import { getBase64 } from '@/_utils/file';

export default {
  name: 'TheHeaderDialog',

  i18n: {
    messages: {
      ru: {
        title: 'Настройки рабочего стола',
        main: 'Основные',
        removeWorkspace: 'Удалить рабочий стол',
        styles: 'Стилизация',
        removeImage: 'Удалить изображение',
        closeBtn: 'Закрыть',
        cancel: 'Отменить',
        submit: 'Применить',
        properties: {
          name: 'Название рабочего стола',
          description: 'Описание рабочего стола',
          allowCreateNewColumn: 'Создание колонок',
          allowColumnMove: 'Перемещение колонок',
          allowCardMove: 'Перемещение карточек',
          allowColumnRemove: 'Удаление колонок',
          allowCreateNewCard: 'Создание карточек',
          allowCardRemove: 'Удаление карточек',
          allowChangeColumnStyle: 'Изменение стиля колонок',
          allowChangeCardStyle: 'Изменение стиля колонок',
          allowChangeCardStatus: 'Изменение статуса карточек',
          workspaceDisabled: 'Отключить рабочий стол',
          backgroundImage: 'Фоновое изображение',
        },
        changingCardsStatusTooltip: 'После изменения статуса на выполенный, поменять статус будет нельзя',
      },
      en: {
        title: 'Workspace settings',
        main: 'Main',
        removeWorkspace: 'Delete workspace',
        styles: 'Stylization',
        removeImage: 'Delete image',
        closeBtn: 'Close',
        cancel: 'cancel',
        submit: 'submit',
        properties: {
          name: 'Workspace name',
          description: 'Workspace description',
          allowCreateNewColumn: 'Creating columns',
          allowColumnMove: 'Moving columns',
          allowCardMove: 'Moving cards',
          allowColumnRemove: 'Removing columns',
          allowCreateNewCard: 'Creating cards',
          allowCardRemove: 'Deleting cards',
          allowChangeColumnStyle: 'Changing card style',
          allowChangeCardStyle: 'Changing column style',
          allowChangeCardStatus: 'Changing the status of cards',
          workspaceDisabled: 'Disable workspace',
          backgroundImage: 'Background image',
        },
        changingCardsStatusTooltip: 'After changing the status to completed, it will not be possible to change the status',
      },
    },
  },

  data() {
    return {
      show: false,
      workspaceName: '',
      workspacePropertySnapshot: {},
      defaultWorkspaceInstance: workspaceInstance(),
      fileLoading: false,
    };
  },

  computed: {
    ...mapState('workspace', ['workspace']),

    currentWorkspace: {
      get() {
        return this.workspace.list.find((workspace) => workspace.uid === this.workspace.current?.uid);
      },
      set(v) {
        this.setCurrentWorkspace(v);
      },
    },
    settingsHasChanges() {
      return !isEqual(this.workspacePropertySnapshot, this.currentWorkspace?.data?.properties);
    },
  },

  methods: {
    ...mapActions('workspace', ['createWorkspace', 'setCurrentWorkspace', 'changeWorkspace', 'removeCurrentWorkspace']),

    // region dialog
    showDialog() {
      this.show = true;
    },
    hideDialog() {
      this.show = false;
    },
    // endregion dialog

    // region workspace
    createWorkspacePropertySnapshot() {
      this.workspacePropertySnapshot = cloneDeep(this.currentWorkspace.data.properties);
    },
    setWorkspaceBackgroundImage(file) {
      if (file) {
        this.fileLoading = true;
        getBase64(file)
          .then((stringFile) => {
            this.workspacePropertySnapshot.backgroundImage = {
              file: stringFile,
              name: file.name,
            };
          })
          .finally(() => { this.fileLoading = false; });
      } else {
        this.workspacePropertySnapshot.backgroundImage = {
          file: null,
          name: '',
        };
      }
    },
    saveWorkspaceProperties() {
      this.changeWorkspace(this.workspacePropertySnapshot);
      this.createWorkspacePropertySnapshot();
    },
    onWorkspaceRemove() {
      this.removeCurrentWorkspace();
      this.hideDialog();
    },
    // endregion workspace

    validateFileTypes(v) {
      const validTypes = ['image/jpeg', 'image/png'];
      return validTypes.includes(v?.type);
    },
  },

  watch: {
    'currentWorkspace.data.properties': {
      handler(v) {
        if (v) {
          this.createWorkspacePropertySnapshot();
        }
      },
    },
  },
};
</script>

<style scoped>

</style>
